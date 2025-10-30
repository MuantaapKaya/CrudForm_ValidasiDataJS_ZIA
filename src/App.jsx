import { useEffect, useMemo, useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Table,
  Toast, ToastContainer, InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Data awal jika localStorage kosong
const initialProducts = [
  { id: 1, name: 'Laptop Gaming', description: 'Laptop dengan spesifikasi tinggi untuk gaming dan desain grafis.', price: 15000000, category: 'Elektronik', releaseDate: '2023-01-15', stock: 25, isActive: true },
  { id: 2, name: 'Kaos Polos', description: 'Kaos katun combed 30s, nyaman dipakai sehari-hari.', price: 75000, category: 'Pakaian', releaseDate: '2022-08-20', stock: 150, isActive: true },
];

// Opsi untuk dropdown kategori
const categoryOptions = ['Elektronik', 'Pakaian', 'Makanan', 'Minuman', 'Lainnya'];

export default function App() {
 
  // Membaca data dari localStorage saat komponen pertama kali dimuat
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });

  // State untuk form input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);

  // State untuk validasi, editing, dan toast
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Side Effect untuk menyimpan ke localStorage setiap kali state `products` berubah
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);


  // FUNGSI-FUNGSI
  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();

    // Validasi Nama Produk
    if (!trimmedName) newErrors.name = 'Nama Produk wajib diisi.';
    else if (trimmedName.length > 100) newErrors.name = 'Maksimal 100 karakter.';
    else {
        const isDuplicate = products.some(p => p.name.toLowerCase() === trimmedName.toLowerCase() && p.id !== editingId);
        if (isDuplicate) newErrors.name = 'Nama Produk sudah ada.';
    }

    // Validasi Deskripsi
    if (description.trim().length > 0 && description.trim().length < 20) newErrors.description = 'Minimal 20 karakter.';

    // Validasi Harga
    if (!price) newErrors.price = 'Harga wajib diisi.';
    else if (isNaN(price) || Number(price) <= 0) newErrors.price = 'Harga harus angka dan lebih besar dari 0.';

    // Validasi Kategori
    if (!category) newErrors.category = 'Kategori wajib dipilih.';

    // Validasi Tanggal Rilis
    if (!releaseDate) newErrors.releaseDate = 'Tanggal Rilis wajib diisi.';
    else if (new Date(releaseDate) > new Date()) newErrors.releaseDate = 'Tanggal tidak boleh di masa depan.';
    
    // Validasi Stok
    if (stock === '' || stock === null) newErrors.stock = 'Stok wajib diisi.';
    else if (isNaN(stock) || Number(stock) < 0) newErrors.stock = 'Stok harus angka dan minimal 0.';

    return newErrors;
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setReleaseDate('');
    setStock('');
    setIsActive(true);
    setErrors({});
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToastMsg('Periksa kembali input Anda, ada data yang tidak valid.', 'danger');
      return;
    }
    
    const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        releaseDate,
        stock: Number(stock),
        isActive
    };

    if (editingId === null) {
      // Tambah Produk Baru
      setProducts([{ id: Date.now(), ...productData }, ...products]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    } else {
      // Update Produk
      setProducts(products.map(p => p.id === editingId ? { ...p, ...productData } : p));
      showToastMsg('Produk berhasil diperbarui.', 'success');
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCategory(product.category);
    setReleaseDate(product.releaseDate);
    setStock(product.stock.toString());
    setIsActive(product.isActive);
    setErrors({});
  };

  const handleDelete = (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus produk "${target.name}"?`)) {
      setProducts(products.filter(p => p.id !== id));
      if (editingId === id) resetForm();
      showToastMsg('Produk berhasil dihapus.', 'success');
    }
  };

  const isEditing = editingId !== null;

  // RENDER KOMPONEN
  return (
    <Container className="py-4">
      <Row>
        {/* KOLOM FORM */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h5">{isEditing ? 'Edit Produk' : 'Tambah Produk'}</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                {/* Nama Produk */}
                <Form.Group className="mb-3" controlId="productName">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control type="text" value={name} onChange={e => setName(e.target.value)} isInvalid={!!errors.name} maxLength={100} placeholder="Contoh: Kemeja Flanel"/>
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
                
                {/* Deskripsi */}
                <Form.Group className="mb-3" controlId="productDescription">
                  <Form.Label>Deskripsi <small className="text-muted">(Opsional)</small></Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} isInvalid={!!errors.description} placeholder="Deskripsi detail produk (min. 20 karakter)"/>
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                {/* Harga */}
                 <Form.Group className="mb-3" controlId="productPrice">
                  <Form.Label>Harga</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>Rp</InputGroup.Text>
                    <Form.Control type="number" value={price} onChange={e => setPrice(e.target.value)} isInvalid={!!errors.price} placeholder="Contoh: 150000"/>
                    <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-3" controlId="productCategory">
                    <Form.Label>Kategori</Form.Label>
                    <Form.Select value={category} onChange={e => setCategory(e.target.value)} isInvalid={!!errors.category}>
                        <option value="">Pilih Kategori...</option>
                        {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                </Form.Group>

                {/* Tanggal Rilis */}
                <Form.Group className="mb-3" controlId="productReleaseDate">
                    <Form.Label>Tanggal Rilis</Form.Label>
                    <Form.Control type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} isInvalid={!!errors.releaseDate} />
                    <Form.Control.Feedback type="invalid">{errors.releaseDate}</Form.Control.Feedback>
                </Form.Group>

                {/* Stok */}
                <Form.Group className="mb-3" controlId="productStock">
                    <Form.Label>Stok Tersedia</Form.Label>
                    <Form.Control type="number" value={stock} onChange={e => setStock(e.target.value)} isInvalid={!!errors.stock} placeholder="Jumlah stok di gudang"/>
                    <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                </Form.Group>
                
                {/* Status Aktif */}
                <Form.Group className="mb-3" controlId="productIsActive">
                    <Form.Check type="switch" label="Produk Aktif (tampilkan di toko)" checked={isActive} onChange={e => setIsActive(e.target.checked)}/>
                </Form.Group>

                {/* Tombol Aksi */}
                <div className="d-flex gap-2">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>Batal</Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* KOLOM TABEL */}
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th className="text-center">#</th>
                    <th>Nama Produk</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-4 text-muted">Belum ada data Produk.</td></tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>
                            {product.name}
                            <div className="text-muted small">{product.description.substring(0, 40)}...</div>
                        </td>
                        <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td>
                            <span className={`badge ${product.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button size="sm" variant="warning" onClick={() => handleEdit(product)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Hapus</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}