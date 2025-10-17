const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());
const DATA_FILE = path.join(__dirname, 'products.json');
function readProducts() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]');
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}
function writeProducts(products) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});
app.get('/products/instock', (req, res) => {
  const products = readProducts();
  const inStockProducts = products.filter(p => p.inStock);
  res.json(inStockProducts);
});
app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;
  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid input format' });
  }
  const products = readProducts();
  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  products[productIndex] = { ...products[productIndex], ...updates };
  writeProducts(products);
  res.json(products[productIndex]);
});
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const products = readProducts();
  const newProducts = products.filter(p => p.id !== id);
  if (newProducts.length === products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }
  writeProducts(newProducts);
  res.json({ message: 'Product deleted successfully' });
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
