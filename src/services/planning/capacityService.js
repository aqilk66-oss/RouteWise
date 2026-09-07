/**
 * Fleet Capacity Validation Engine
 * Evaluates student roster numbers against vehicle design capacity.
 */
export const validateCapacity = ({
  busCapacity = 0,
  assignedStudentsCount = 0,
  warningThreshold = 0.9, // 90% utilization warning
}) => {
  const capacity = Number(busCapacity) || 0;
  const count = Number(assignedStudentsCount) || 0;

  if (capacity <= 0) {
    return {
      status: 'unknown',
      capacity: 0,
      assignedCount: count,
      remainingSeats: 0,
      utilizationRate: 0,
      isOverCapacity: false,
      isNearCapacity: false,
      label: 'Capacity unknown / unassigned bus',
      message: 'Bus capacity is unconfigured or zero. Assign an active bus to validate capacity.',
    };
  }

  const remainingSeats = capacity - count;
  const utilizationRate = Math.round((count / capacity) * 100);
  const isOverCapacity = count > capacity;
  const isNearCapacity = !isOverCapacity && (count / capacity >= warningThreshold);

  let status = 'within';
  let label = 'Within Safe Capacity';
  let message = `${count} of ${capacity} seats occupied (${remainingSeats} seats available).`;

  if (isOverCapacity) {
    status = 'over';
    label = 'Over Capacity Alert';
    message = `Critical: ${count} students assigned exceed bus design limit of ${capacity} by ${Math.abs(remainingSeats)} seats.`;
  } else if (isNearCapacity) {
    status = 'near';
    label = 'Near Capacity Warning';
    message = `Warning: High occupancy at ${utilizationRate}% (${remainingSeats} remaining).`;
  }

  return {
    status, // 'within' | 'near' | 'over' | 'unknown'
    capacity,
    assignedCount: count,
    remainingSeats,
    utilizationRate,
    isOverCapacity,
    isNearCapacity,
    label,
    message,
  };
};

export const capacityService = {
  validateCapacity,
};

export default capacityService;
