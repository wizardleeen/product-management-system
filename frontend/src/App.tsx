import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  category: string
  status: 'active' | 'inactive'
}

// Backend API URL - change this to your backend URL in production
const API_URL = 'https://product-management-system1.kyvy.me/api'

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    status: 'active'
  })

  const categories = ['电子产品', '服装', '食品', '图书', '家居', '其他']

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get<Product[]>(`${API_URL}/products`)
      setProducts(response.data)
      setError('')
    } catch (err) {
      setError('获取产品列表失败，请确保后端服务正在运行')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData)
      } else {
        await axios.post(`${API_URL}/products`, formData)
      }
      fetchProducts()
      closeModal()
    } catch (err) {
      setError(editingProduct ? '更新产品失败' : '创建产品失败')
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个产品吗？')) return
    try {
      await axios.delete(`${API_URL}/products/${id}`)
      fetchProducts()
    } catch (err) {
      setError('删除产品失败')
      console.error(err)
    }
  }

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        status: product.status
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        status: 'active'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || product.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length
  const outOfStock = products.filter(p => p.stock === 0).length

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { class: 'stock-out', text: '缺货' }
    if (stock <= 10) return { class: 'stock-low', text: '库存不足' }
    return { class: 'stock-in', text: '有货' }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📦 产品管理系统</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + 添加产品
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">产品总数</div>
          <div className="stat-value">{totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">总库存价值</div>
          <div className="stat-value">¥{totalValue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">库存不足</div>
          <div className="stat-value">{lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">缺货产品</div>
          <div className="stat-value">{outOfStock}</div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索产品名称或描述..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="search-input"
          style={{ width: '200px' }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">所有分类</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">加载中...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>没有找到产品</h3>
            <p>点击"添加产品"按钮创建一个新产品</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>产品名称</th>
                <th>分类</th>
                <th>价格</th>
                <th>库存</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <tr key={product.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {product.description.substring(0, 50)}...
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="price">¥{product.price.toLocaleString()}</td>
                    <td>
                      <span className={`stock ${stockStatus.class}`}>
                        {product.stock} - {stockStatus.text}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${product.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                        {product.status === 'active' ? '在售' : '下架'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => openModal(product)}
                        >
                          编辑
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? '编辑产品' : '添加产品'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>产品名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>产品描述</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>价格 (¥)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>库存数量</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>分类</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">选择分类</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>状态</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    >
                      <option value="active">在售</option>
                      <option value="inactive">下架</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? '保存修改' : '创建产品'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
