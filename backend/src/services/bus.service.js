// Mock buses data
const buses = [
  { id: '001', licensePlate: 'BUS-001', unitName: 'Unidad 001', status: 'parked', route: '101', driver: 'Carlos Rodríguez', movingTime: 332, parkedTime: 110, isFavorite: false },
  { id: '002', licensePlate: 'BUS-002', unitName: 'Unidad 002', status: 'moving', route: '102', driver: 'María González', movingTime: 245, parkedTime: 45, isFavorite: true },
  { id: '003', licensePlate: 'BUS-003', unitName: 'Unidad 003', status: 'parked', route: '201', driver: 'José López', movingTime: 180, parkedTime: 90, isFavorite: false },
  { id: '004', licensePlate: 'BUS-004', unitName: 'Unidad 004', status: 'moving', route: '205', driver: 'Ana Martínez', movingTime: 420, parkedTime: 30, isFavorite: true },
  { id: '005', licensePlate: 'BUS-005', unitName: 'Unidad 005', status: 'parked', route: '301', driver: 'Luis Hernández', movingTime: 200, parkedTime: 120, isFavorite: false },
  { id: '006', licensePlate: 'BUS-006', unitName: 'Unidad 006', status: 'moving', route: '305', driver: 'Carmen Jiménez', movingTime: 380, parkedTime: 60, isFavorite: true },
  { id: '007', licensePlate: 'BUS-007', unitName: 'Unidad 007', status: 'parked', route: '401', driver: 'Roberto Silva', movingTime: 150, parkedTime: 180, isFavorite: false },
  { id: '008', licensePlate: 'BUS-008', unitName: 'Unidad 008', status: 'moving', route: '501', driver: 'Patricia Vargas', movingTime: 290, parkedTime: 75, isFavorite: true },
  { id: '009', licensePlate: 'BUS-009', unitName: 'Unidad 009', status: 'parked', route: '101', driver: 'Miguel Castillo', movingTime: 220, parkedTime: 95, isFavorite: false },
  { id: '010', licensePlate: 'BUS-010', unitName: 'Unidad 010', status: 'parked', route: '102', driver: 'Laura Morales', movingTime: 160, parkedTime: 140, isFavorite: false },
  { id: '011', licensePlate: 'BUS-011', unitName: 'Unidad 011', status: 'parked', route: '201', driver: 'Fernando Vega', movingTime: 190, parkedTime: 110, isFavorite: false },
  { id: '012', licensePlate: 'BUS-012', unitName: 'Unidad 012', status: 'parked', route: '205', driver: 'Sofía Ramírez', movingTime: 170, parkedTime: 130, isFavorite: false },
];

function listBuses() {
  return buses;
}

function setFavorite(id, isFavorite) {
  const idx = buses.findIndex(b => b.id === id);
  if (idx === -1) return null;
  buses[idx].isFavorite = !!isFavorite;
  return buses[idx];
}

module.exports = { listBuses, setFavorite };
