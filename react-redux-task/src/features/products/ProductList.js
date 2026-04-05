import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from './productSlice';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle, Loader2, ShoppingBag, Euro } from 'lucide-react';
import ProductForm from './ProductForm';
import DeleteModal from '../../components/DeleteModal';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setActionLoading(true);
      await dispatch(deleteProduct(productToDelete.id));
      setActionLoading(false);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = async (formData) => {
    setActionLoading(true);
    if (editingProduct) {
      await dispatch(updateProduct({ id: editingProduct.id, product: formData }));
    } else {
      await dispatch(addProduct(formData));
    }
    setActionLoading(false);
    setIsModalOpen(false);
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Fetching inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-7 h-7 text-primary-600" />
            Product Inventory
          </h1>
          <p className="text-slate-500 mt-1">Manage and track your store's items in real-time.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 border border-transparent rounded-xl shadow-lg shadow-primary-200 text-sm font-semibold text-white hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:translate-y-0"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </button>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-xl font-bold text-slate-800">{items.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Euro className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. Price</p>
            <p className="text-xl font-bold text-slate-800">
              ${items.length > 0 ? (items.reduce((acc, curr) => acc + Number(curr.price || 0), 0) / items.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <p className="text-xl font-bold text-slate-800">{items.filter(i => i.stock !== null && i.stock !== undefined && Number(i.stock) === 0).length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary-500 text-slate-400 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search products by name or category..."
          className="block w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 shadow-sm transition-all"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider leading-4">Product Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider leading-4">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider leading-4">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider leading-4">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider leading-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-400 transition-colors">
                        {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                            <ShoppingBag size={20} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-slate-900 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-600 capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">${Number(item.price).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Number(item.stock) > 10 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">In Stock</span>
                    ) : Number(item.stock) > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">Low Stock</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">Out of Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 px-1 transition-opacity">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                        disabled={actionLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-lg font-medium">No results found for "{searchTerm}"</p>
                    <p className="text-sm">Try adjusting your search terms.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductForm
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        loading={actionLoading}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        productName={productToDelete?.title}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductList;
