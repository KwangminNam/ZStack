let counter = 0;

export function generateId(): string {
  return `act_${Date.now().toString(36)}_${(counter++).toString(36)}`;
}
