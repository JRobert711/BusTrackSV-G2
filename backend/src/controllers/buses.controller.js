const { listBuses, setFavorite } = require('../services/bus.service');

async function getBuses(req, res) {
  return res.json(listBuses());
}

async function toggleFavorite(req, res) {
  const { id } = req.params;
  const { isFavorite } = req.body || {};
  const updated = setFavorite(id, isFavorite);
  if (!updated) {
    return res.status(404).json({ message: 'Bus no encontrado' });
  }
  return res.json(updated);
}

module.exports = { getBuses, toggleFavorite };
