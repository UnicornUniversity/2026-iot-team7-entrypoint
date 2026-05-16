import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificatesService implements OnModuleInit {
    private readonly logger = new Logger(CertificatesService.name);
    private readonly certsDir = '/tmp/certs'; // production
    private readonly localCertsDir = path.join(process.cwd(), 'certs'); // local

    constructor(private readonly config: ConfigService) {}

    async onModuleInit() {
        await this.loadCertificates();
    }

    private async loadCertificates() {
        try {
            // Local testing
            if (process.env.NODE_ENV !== 'production') {
                if (fs.existsSync(this.localCertsDir)) {
                    this.logger.log(`Using local certificates from: ${this.localCertsDir}`);
                    return;
                } else {
                    this.logger.warn(`Local certs folder not found: ${this.localCertsDir}`);
                }
            }

            // Production - fly.io
            if (!fs.existsSync(this.certsDir)) {
                fs.mkdirSync(this.certsDir, { recursive: true });
            }

            const certMap: Record<string, string | undefined> = {
                'ca-cert.pem': this.config.get<string>('CERT_CA'),
                'server-cert.pem': this.config.get<string>('CERT_SERVER_CERT'),
                'server-key.pem': this.config.get<string>('CERT_SERVER_KEY'),
            };

            let loaded = 0;
            for (const [filename, base64Content] of Object.entries(certMap)) {
                if (base64Content) {
                    const filePath = path.join(this.certsDir, filename);
                    fs.writeFileSync(filePath, Buffer.from(base64Content, 'base64'));
                    this.logger.log(`Certificate loaded: ${filename}`);
                    loaded++;
                } else {
                    this.logger.warn(`Missing certificate in env: ${filename}`);
                }
            }

            if (loaded === 0) {
                this.logger.error('No certificates were loaded!');
                return;
            }

            fs.chmodSync(path.join(this.certsDir, 'server-key.pem'), 0o600);
            fs.chmodSync(path.join(this.certsDir, 'ca-cert.pem'), 0o644);
            fs.chmodSync(path.join(this.certsDir, 'server-cert.pem'), 0o644);

            this.logger.log('All certificates successfully written to /tmp/certs');
        } catch (error) {
            this.logger.error('Failed to load certificates', error);
            if (process.env.NODE_ENV === 'production') throw error;
        }
    }

    getCertsDir(): string {
        return process.env.NODE_ENV === 'production' ? this.certsDir : this.localCertsDir;
    }
}
