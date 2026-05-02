import express from 'express';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// User Database
const users = {
    '032226C8': { firstName: 'Lukáš', lastName: 'Skywalker' },
    'A620F05F': { firstName: 'John', lastName: 'Doe' }
};

// State Tracking
const lastUserStates = {};

// Gateway Database
const gateways = {
    'GWAY-99-SECRET-XYZ': { id: 'GWAY-01', desc: 'Main Entrance' },
    'OFFICE-KEY-123': { id: 'GWAY-02', desc: 'Office Door' },
    'LAB-KEY-456': { id: 'GWAY-03', desc: 'Hardware Lab' }
};

const attendanceLog = [];

// --- MIDDLEWARE ---
const authorizeGateway = (req, res, next) => {
    const gatewayKey = req.body.gateway_key;
    const gatewayInfo = gateways[gatewayKey];
    if (!gatewayInfo) {
        return res.status(401).json({ status: 'DENIED', message: 'Unauthorized Gateway' });
    }
    req.gateway = gatewayInfo;
    next();
};

// --- GLOBAL SYSTEM ROUTES ---
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// --- API V1 ROUTER ---
const apiV1 = express.Router();

apiV1.post('/attendance', authorizeGateway, (req, res) => {
    const data = req.body;
    const user = users[data.uid];
    if (!user) return res.json({ status: 'DENIED' });

    let rawEvent = (data.event || "").toLowerCase();
    let determinedEvent = rawEvent;

    if (rawEvent === 'auto') {
        const lastEvent = lastUserStates[data.uid];
        determinedEvent = (lastEvent === 'arrival') ? 'departure' : 'arrival';
    }

    lastUserStates[data.uid] = determinedEvent;
    attendanceLog.push({
        uid: data.uid,
        firstName: user.firstName,
        lastName: user.lastName,
        type: determinedEvent,
        time: data.timestamp,
        gateway: req.gateway.desc
    });

    console.log(`RECORDED [${determinedEvent.toUpperCase()}]: ${user.firstName} ${user.lastName} at ${req.gateway.desc}`);

    return res.json({ 
        status: 'OK', 
        event: determinedEvent,
        firstName: user.firstName, 
        lastName: user.lastName 
    });
});

apiV1.post('/attendance/batch', authorizeGateway, (req, res) => {
    const batch = req.body;
    let processedCount = 0;
    batch.events.forEach(event => {
        const user = users[event.uid];
        if (user) {
            const eventType = (event.event || "arrival").toLowerCase();
            lastUserStates[event.uid] = eventType; 
            attendanceLog.push({
                uid: event.uid,
                firstName: user.firstName,
                lastName: user.lastName,
                type: eventType,
                time: event.timestamp,
                gateway: req.gateway.desc,
                synced_offline: true
            });
            console.log(`SYNCED [${eventType.toUpperCase()}]: ${user.firstName} ${user.lastName} (Offline)`);
            processedCount++;
        }
    });
    return res.json({ status: 'OK', processed: processedCount });
});

apiV1.get('/logs', (req, res) => res.json(attendanceLog));

// Mount Router
app.use('/api/v1', apiV1);

app.listen(port, () => {
    console.log(`Attendance Backend listening on port ${port}`);
});
