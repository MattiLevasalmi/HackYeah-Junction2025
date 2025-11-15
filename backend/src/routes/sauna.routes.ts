import { Router } from 'express';
import { SaunaSensorController } from '../controllers/sauna-sensor.controller';
import { SaunaCoachController } from '../controllers/sauna-coach.controller';

const router = Router();
const sensorController = new SaunaSensorController();
const coachController = new SaunaCoachController();

// Sauna Sensor Control Routes
router.get('/sensor', (req, res) => sensorController.getSensorData(req, res));
router.post('/sensor/update', (req, res) => sensorController.updateSensorData(req, res));
router.post('/sensor/voice-command', (req, res) => sensorController.processVoiceCommand(req, res));

// Sauna Coach Routes
router.post('/coach/session/start', (req, res) => coachController.startSession(req, res));
router.get('/coach/session/:sessionId/schedule', (req, res) => coachController.getSessionSchedule(req, res));
router.post('/coach/session/:sessionId/guidance', (req, res) => coachController.getNextGuidance(req, res));
router.post('/coach/session/:sessionId/input', (req, res) => coachController.handleUserInput(req, res));
router.post('/coach/session/:sessionId/end', (req, res) => coachController.endSession(req, res));

export default router;