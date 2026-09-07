import { busService } from '../services/firestore/busService';
import { routeService } from '../services/firestore/routeService';
import { driverService } from '../services/firestore/driverService';
import { studentService } from '../services/firestore/studentService';
import { stopService } from '../services/firestore/stopService';

/**
 * Explicit, non-destructive demo seed data helper.
 * Only adds sample development documents if collection is completely empty.
 * Never deletes or overwrites existing records.
 */
export const seedDevelopmentData = async () => {
  try {
    const existingBuses = await busService.getAll({ max: 1 });
    if (existingBuses.length > 0) {
      return { seeded: false, message: 'Firestore collections already contain records. Seed skipped to protect data.' };
    }

    // 1. Seed Sample Buses
    const bus1 = await busService.createBus({
      busNumber: 'Bus 24',
      registrationNumber: 'NY-SCH-8824',
      capacity: 32,
      model: 'Volvo 9700 Transit',
      year: 2024,
    });

    const bus2 = await busService.createBus({
      busNumber: 'Bus 12',
      registrationNumber: 'NY-SCH-1122',
      capacity: 28,
      model: 'Blue Bird All American',
      year: 2023,
    });

    // 2. Seed Sample Route
    const route = await routeService.createRoute({
      routeCode: 'EXP-14',
      name: 'North Campus Express Loop',
      description: 'Morning and afternoon student corridor across Lincoln Heights.',
      assignedBusId: bus1.id,
      estimatedDuration: '38 mins',
      distance: '14.2 miles',
    });

    // 3. Seed Sample Stops
    await stopService.createStop({
      name: 'Maple Avenue & 4th Street',
      address: '400 Maple Ave',
      routeId: route.id,
      sequence: 1,
      pickupTime: '07:35 AM',
      dropoffTime: '03:30 PM',
    });

    await stopService.createStop({
      name: 'Lincoln Park Community Crossing',
      address: '820 Lincoln Blvd',
      routeId: route.id,
      sequence: 2,
      pickupTime: '07:48 AM',
      dropoffTime: '03:45 PM',
    });

    // 4. Seed Sample Student
    await studentService.createStudent({
      firstName: 'Emily',
      lastName: 'Watson',
      grade: 'Grade 5',
      className: 'Room 204',
      routeId: route.id,
      busId: bus1.id,
    });

    return { seeded: true, message: 'Development demo dataset provisioned successfully.' };
  } catch (err) {
    console.warn("Seed utility caught error:", err.message);
    return { seeded: false, message: err.message };
  }
};

export default seedDevelopmentData;
