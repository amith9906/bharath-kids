import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiDownload, FiSend, FiTrash2, FiPlus } from 'react-icons/fi';
import { FaWhatsapp, FaBuilding } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { adminAPI, getImageUrl } from '../../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const QuotationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [removedItemIds, setRemovedItemIds] = useState([]);
  const [adminPriceAdjustment, setAdminPriceAdjustment] = useState('0');
  const [adminGstPercent, setAdminGstPercent] = useState('0');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Add item states
  const [showAddItem, setShowAddItem] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [searchItem, setSearchItem] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);

  // PDF & Send states
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const { showNotification } = useNotification();
  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getQuotation(id);
      const q = response.data.quotation;
      setQuotation(q);
      setNewStatus(q.status);
      setAdminPriceAdjustment(q.adminPriceAdjustment?.toString() || '0');
      setAdminGstPercent(q.adminGstPercent?.toString() || '0');
      setAdminNotes(q.adminNotes || '');
      setEditedItems(q.items?.map(item => ({
        id: item.id,
        itemName: item.itemName,
        unitPrice: item.unitPrice?.toString() || '0',
        quantity: item.quantity,
        discountPercent: item.discountPercent,
        igstRate: item.igstRate,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        isNew: false
      })) || []);
      setRemovedItemIds([]);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === quotation.status) {
      showNotification('Status is the same', 'info');
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.updateQuotationStatus(id, {
        status: newStatus,
        notes: statusNotes
      });
      showNotification(t('admin.quotations.statusUpdated'), 'success');
      fetchQuotation();
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleItemPriceChange = (itemId, newPrice) => {
    setEditedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, unitPrice: newPrice } : item
      )
    );
  };

  const handleItemNameChange = (itemId, newName) => {
    setEditedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, itemName: newName } : item
      )
    );
  };

  const handleItemQuantityChange = (itemId, newQty) => {
    setEditedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: parseInt(newQty) || 1 } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    const item = editedItems.find(i => i.id === itemId);
    if (item && !item.isNew) {
      setRemovedItemIds(prev => [...prev, itemId]);
    }
    setEditedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const fetchAvailableItems = async (search = '') => {
    setLoadingItems(true);
    try {
      const response = await adminAPI.getItems({ search, limit: 20 });
      setAvailableItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleAddNewItem = (item) => {
    const newItem = {
      id: `new-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      unitPrice: item.price?.toString() || '0',
      quantity: 1,
      discountPercent: item.discountPercent || 0,
      igstRate: item.igstRate || 0,
      cgstRate: item.cgstRate || 0,
      sgstRate: item.sgstRate || 0,
      isNew: true
    };
    setEditedItems(prev => [...prev, newItem]);
    setShowAddItem(false);
    setSearchItem('');
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await adminAPI.editQuotation(id, {
        adminPriceAdjustment: parseFloat(adminPriceAdjustment) || 0,
        adminGstPercent: parseFloat(adminGstPercent) || 0,
        adminNotes,
        itemAdjustments: editedItems.filter(item => !item.isNew).map(item => ({
          id: item.id,
          itemName: item.itemName,
          unitPrice: parseFloat(item.unitPrice) || 0,
          quantity: item.quantity
        })),
        newItems: editedItems.filter(item => item.isNew).map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          unitPrice: parseFloat(item.unitPrice) || 0,
          quantity: item.quantity,
          discountPercent: item.discountPercent,
          igstRate: item.igstRate,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate
        })),
        removedItemIds
      });
      toast.success('Quotation updated successfully');
      setEditMode(false);
      fetchQuotation();
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPdf(true);
    try {
      const response = await adminAPI.generatePDF(id);
      toast.success('PDF generated successfully');

      // Open PDF in new tab
      window.open(response.data.pdfUrl, '_blank');
      fetchQuotation();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await adminAPI.getPDF(id);
      if (response.data.pdfUrl) {
        window.open(response.data.pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleSendQuotation = async (method) => {
    setSending(true);
    try {
      const response = await adminAPI.sendQuotation(id, { method });
      const results = response.data.results;

      if (method === 'email' && results.email) {
        toast.success('Quotation sent via email');
      } else if (method === 'whatsapp' && results.whatsapp) {
        toast.success('Quotation sent via WhatsApp');
      } else if (method === 'both') {
        const msgs = [];
        if (results.email) msgs.push('email');
        if (results.whatsapp) msgs.push('WhatsApp');
        if (msgs.length > 0) {
          toast.success(`Quotation sent via ${msgs.join(' and ')}`);
        }
      }

      setShowSendModal(false);
      fetchQuotation();
    } catch (error) {
      console.error('Error sending quotation:', error);
      toast.error('Failed to send quotation');
    } finally {
      setSending(false);
    }
  };

  // Calculate edited totals
  const calculateEditedTotals = () => {
    if (!editedItems || editedItems.length === 0) return { subtotal: 0, grandTotal: 0, finalTotal: 0 };

    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    editedItems.forEach(item => {
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const quantity = item.quantity || 1;
      const itemSubtotal = unitPrice * quantity;

      const discountPercent = parseFloat(item.discountPercent) || 0;
      const discountAmount = (itemSubtotal * discountPercent) / 100;
      const taxableAmount = itemSubtotal - discountAmount;

      const igst = parseFloat(item.igstRate) || 0;
      const cgst = parseFloat(item.cgstRate) || 0;
      const sgst = parseFloat(item.sgstRate) || 0;
      const tax = (taxableAmount * (igst + cgst + sgst)) / 100;

      subtotal += itemSubtotal;
      discountTotal += discountAmount;
      taxTotal += tax;
    });

    const grandTotal = subtotal - discountTotal + taxTotal;
    const priceAdj = parseFloat(adminPriceAdjustment) || 0;
    const gstPct = parseFloat(adminGstPercent) || 0;
    const adminGst = (grandTotal + priceAdj) * (gstPct / 100);
    const finalTotal = grandTotal + priceAdj + adminGst;

    return { subtotal, discountTotal, taxTotal, grandTotal, adminGst, finalTotal };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quotation not found</p>
      </div>
    );
  }

  const editedTotals = editMode ? calculateEditedTotals() : null;
  const finalTotal = quotation.finalTotal || quotation.grandTotal;

  return (
    <div className="space-y-6">
      <Link
        to="/admin/quotations"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {quotation.quotationNumber}
          </h1>
          <p className="text-gray-500">{formatDate(quotation.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge badge-${quotation.status} text-base px-4 py-2`}>
            {t(`quotations.statuses.${quotation.status}`)}
          </span>
          {quotation.sentToCustomer && (
            <span className="badge bg-green-100 text-green-800 px-3 py-1">
              Sent to Customer
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="btn btn-secondary"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Prices
          </button>
        ) : (
          <>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="btn btn-primary"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                fetchQuotation();
              }}
              className="btn btn-secondary"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </button>
          </>
        )}

        <button
          onClick={handleGeneratePDF}
          disabled={generatingPdf}
          className="btn btn-secondary"
        >
          <FiDownload className="w-4 h-4" />
          {generatingPdf ? 'Generating...' : 'Generate PDF'}
        </button>

        {quotation.pdfUrl && (
          <button
            onClick={handleDownloadPDF}
            className="btn btn-secondary"
          >
            <FiDownload className="w-4 h-4" />
            Download PDF
          </button>
        )}

        <button
          onClick={() => setShowSendModal(true)}
          className="btn btn-primary"
        >
          <FiSend className="w-4 h-4" />
          Send to Customer
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('checkout.customerDetails')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('checkout.name')}</p>
                <p className="font-medium">{quotation.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiMail className="w-4 h-4" /> {t('checkout.email')}
                </p>
                <p className="font-medium">{quotation.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiPhone className="w-4 h-4" /> {t('checkout.phone')}
                </p>
                <p className="font-medium">{quotation.customerPhone}</p>
              </div>
              {quotation.customerCompany && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaBuilding className="w-4 h-4" /> {t('checkout.company')}
                  </p>
                  <p className="font-medium">{quotation.customerCompany}</p>
                </div>
              )}
              {quotation.customerAddress && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" /> {t('checkout.address')}
                  </p>
                  <p className="font-medium">{quotation.customerAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('quotations.items')}
                {editMode && <span className="text-sm font-normal text-primary-600 ml-2">(Edit Mode)</span>}
              </h2>
              {editMode && (
                <button
                  onClick={() => {
                    setShowAddItem(true);
                    fetchAvailableItems();
                  }}
                  className="btn btn-secondary text-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Item
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left pb-3">{t('cart.item')}</th>
                    <th className="text-center pb-3">{t('cart.quantity')}</th>
                    <th className="text-right pb-3">{t('cart.unitPrice')}</th>
                    <th className="text-right pb-3">{t('items.discount')}</th>
                    <th className="text-right pb-3">{t('items.tax')}</th>
                    <th className="text-right pb-3">{t('cart.total')}</th>
                    {editMode && <th className="text-center pb-3 w-12"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {editMode ? (
                    // Edit mode - show editable items
                    editedItems.map((item) => {
                      const unitPrice = parseFloat(item.unitPrice) || 0;
                      const quantity = item.quantity || 1;
                      const itemSubtotal = unitPrice * quantity;
                      const discountAmount = (itemSubtotal * (parseFloat(item.discountPercent) || 0)) / 100;
                      const taxableAmount = itemSubtotal - discountAmount;
                      const igst = parseFloat(item.igstRate) || 0;
                      const cgst = parseFloat(item.cgstRate) || 0;
                      const sgst = parseFloat(item.sgstRate) || 0;
                      const taxAmount = (taxableAmount * (igst + cgst + sgst)) / 100;
                      const totalPrice = taxableAmount + taxAmount;

                      return (
                        <tr key={item.id} className={item.isNew ? 'bg-green-50' : ''}>
                          <td className="py-3">
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                              className="input text-sm w-full"
                              placeholder="Item name"
                            />
                            {item.isNew && (
                              <span className="text-xs text-green-600 font-medium">New item</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                              className="input w-20 text-center text-sm"
                              min="1"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                              className="input w-28 text-right text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-3 text-right text-green-600">
                            {item.discountPercent > 0 ? `-${item.discountPercent}%` : '-'}
                          </td>
                          <td className="py-3 text-right text-sm">
                            {igst > 0 && <p>IGST: {igst}%</p>}
                            {cgst > 0 && <p>CGST: {cgst}%</p>}
                            {sgst > 0 && <p>SGST: {sgst}%</p>}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(totalPrice)}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Remove item"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    // View mode - show original items
                    quotation.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="font-medium">
                            {item.item?.brand && <span className="text-primary-600">{item.item.brand} - </span>}
                            {item.itemName}
                          </p>
                          {item.hsnCode && (
                            <p className="text-xs text-gray-500">HSN: {item.hsnCode}</p>
                          )}
                        </td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-3 text-right text-green-600">
                          {item.discountPercent > 0 ? `-${item.discountPercent}%` : '-'}
                        </td>
                        <td className="py-3 text-right text-sm">
                          {item.igstRate > 0 && <p>IGST: {item.igstRate}%</p>}
                          {item.cgstRate > 0 && <p>CGST: {item.cgstRate}%</p>}
                          {item.sgstRate > 0 && <p>SGST: {item.sgstRate}%</p>}
                        </td>
                        <td className="py-3 text-right font-semibold">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">
                  {formatCurrency(editMode ? editedTotals.subtotal : quotation.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>{t('cart.discountTotal')}</span>
                <span>-{formatCurrency(editMode ? editedTotals.discountTotal : quotation.discountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.taxTotal')}</span>
                <span className="font-medium">
                  {formatCurrency(editMode ? editedTotals.taxTotal : quotation.taxTotal)}
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(editMode ? editedTotals.grandTotal : quotation.grandTotal)}</span>
              </div>

              {/* Admin Adjustments */}
              {editMode ? (
                <div className="border-t pt-3 mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600">Price Adjustment</label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        value={adminPriceAdjustment}
                        onChange={(e) => setAdminPriceAdjustment(e.target.value)}
                        className="input w-32 text-right"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-gray-600">Additional GST %</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={adminGstPercent}
                        onChange={(e) => setAdminGstPercent(e.target.value)}
                        className="input w-24 text-right"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                  {editedTotals.adminGst > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Amount</span>
                      <span>{formatCurrency(editedTotals.adminGst)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {quotation.adminPriceAdjustment && parseFloat(quotation.adminPriceAdjustment) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Adjustment</span>
                      <span className={parseFloat(quotation.adminPriceAdjustment) > 0 ? 'text-red-600' : 'text-green-600'}>
                        {parseFloat(quotation.adminPriceAdjustment) > 0 ? '+' : ''}
                        {formatCurrency(quotation.adminPriceAdjustment)}
                      </span>
                    </div>
                  )}
                  {quotation.adminGstAmount && parseFloat(quotation.adminGstAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional GST ({quotation.adminGstPercent}%)</span>
                      <span>{formatCurrency(quotation.adminGstAmount)}</span>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Final Total</span>
                <span className="text-primary-600">
                  {formatCurrency(editMode ? editedTotals.finalTotal : finalTotal)}
                </span>
              </div>
            </div>

            {/* GST Disclaimer */}
            {!quotation.taxTotal && !quotation.adminGstAmount && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold text-sm">
                  * This quotation does not include GST. GST will be charged as applicable.
                </p>
              </div>
            )}
          </div>

          {/* Admin Notes (Edit Mode) */}
          {editMode && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Notes</h2>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="input"
                placeholder="Add notes for the customer (will appear on the quotation)"
              />
            </div>
          )}

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Customer Notes
              </h2>
              <p className="text-gray-600">{quotation.notes}</p>
            </div>
          )}

          {quotation.adminNotes && !editMode && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Notes
              </h2>
              <p className="text-gray-600">{quotation.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('admin.quotations.updateStatus')}
            </h2>
            <div className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input"
              >
                <option value="pending">{t('quotations.statuses.pending')}</option>
                <option value="under_review">{t('quotations.statuses.under_review')}</option>
                <option value="approved">{t('quotations.statuses.approved')}</option>
                <option value="rejected">{t('quotations.statuses.rejected')}</option>
                <option value="converted">{t('quotations.statuses.converted')}</option>
              </select>

              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder={t('admin.quotations.addNotes')}
                rows={3}
                className="input"
              />

              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn btn-primary w-full"
              >
                {updating ? t('common.loading') : t('admin.quotations.updateStatus')}
              </button>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('admin.quotations.statusHistory')}
            </h2>
            <div className="space-y-4">
              {quotation.statusHistory?.map((history) => (
                <div key={history.id} className="border-l-2 border-primary-200 pl-4">
                  <span className={`badge badge-${history.status} text-xs`}>
                    {t(`quotations.statuses.${history.status}`)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(history.createdAt)}
                  </p>
                  {history.changedByUser && (
                    <p className="text-xs text-gray-400">
                      by {history.changedByUser.name}
                    </p>
                  )}
                  {history.notes && (
                    <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Quotation to Customer</h2>
            <p className="text-gray-600 mb-4">
              Send the quotation to <strong>{quotation.customerName}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Email: {quotation.customerEmail}<br />
              Phone: {quotation.customerPhone}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSendQuotation('email')}
                disabled={sending}
                className="btn btn-secondary w-full justify-center"
              >
                <FiMail className="w-5 h-5" />
                Send via Email
              </button>
              <button
                onClick={() => handleSendQuotation('whatsapp')}
                disabled={sending}
                className="btn btn-secondary w-full justify-center bg-green-500 text-white hover:bg-green-600"
              >
                <FaWhatsapp className="w-5 h-5" />
                Send via WhatsApp
              </button>
              <button
                onClick={() => handleSendQuotation('both')}
                disabled={sending}
                className="btn btn-primary w-full justify-center"
              >
                <FiSend className="w-5 h-5" />
                Send via Both
              </button>
            </div>

            <button
              onClick={() => setShowSendModal(false)}
              className="btn btn-secondary w-full mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Item to Quotation</h2>
              <button
                onClick={() => {
                  setShowAddItem(false);
                  setSearchItem('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                  fetchAvailableItems(e.target.value);
                }}
                placeholder="Search items by name..."
                className="input"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingItems ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : availableItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items found</p>
              ) : (
                <div className="space-y-2">
                  {availableItems.map((item) => {
                    const alreadyAdded = editedItems.some(e => e.itemId === item.id || (e.id === item.id && !e.isNew));
                    return (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg ${alreadyAdded ? 'bg-gray-100 opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                        onClick={() => !alreadyAdded && handleAddNewItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {item.brand && <span className="text-primary-600">{item.brand} - </span>}
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-600">{formatCurrency(item.price)}</p>
                            {alreadyAdded && <span className="text-xs text-gray-500">Already added</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetails;
