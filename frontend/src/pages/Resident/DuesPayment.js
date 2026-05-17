import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../utils/api';

const DuesPayment = () => {
  const [duesData, setDuesData] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentSettings, setPaymentSettings] = useState({
    payment_transfer_method: 'IBAN',
    payment_transfer_details: 'Loading...'
  });
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchDuesData();
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await api.get('/settings/payment');
      setPaymentSettings(response.data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const fetchDuesData = async () => {
    try {
      // Fetch dues for the user's apartment
      const response = await api.get('/dues/user');
      setDuesData(response.data.dues || []);
      
      // Mock payment history - in production, fetch from backend
      setPaymentHistory([
        { id: 'TX-90821', date: 'Sep 15, 2023', description: 'Monthly Maintenance + Parking', amount: 1450.00 },
        { id: 'TX-89234', date: 'Aug 15, 2023', description: 'Monthly Maintenance + Utility', amount: 2200.00 },
        { id: 'TX-87110', date: 'Jul 15, 2023', description: 'Monthly Maintenance', amount: 1200.00 }
      ]);
    } catch (error) {
      console.error('Error fetching dues data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      // In production, process payment through backend
      alert('Payment processing would happen here');
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const pendingDues = duesData.filter(d => d.status === 'pending' || d.status === 'overdue');
  const totalAmount = pendingDues.reduce((sum, due) => sum + parseFloat(due.amount), 0);

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-12 py-2 border-b border-surface-dim px-8">
        <span>Portal</span>
        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
        <span className="text-primary">Payments</span>
      </div>

      <div className="px-8 pb-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Summary & Method Selection */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            {/* Debt Summary Card */}
            <section className="bg-surface-container-lowest p-8 shadow-[0_8px_24px_rgba(26,28,28,0.04)]">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Current Debt Summary</h3>
              <div className="mb-8">
                <span className="text-[3.5rem] font-extrabold tracking-tighter leading-none">${totalAmount.toFixed(2)}</span>
                <p className="text-sm text-on-surface-variant mt-2 font-medium">
                  {pendingDues.length > 0 ? `Due by ${new Date(pendingDues[0].due_date).toLocaleDateString()}` : 'No pending dues'}
                </p>
              </div>
              {pendingDues.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-surface-container">
                  {pendingDues.map((due) => (
                    <div key={due.due_id} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant capitalize">{due.type?.replace('_', ' ')}</span>
                      <span className="font-bold">${parseFloat(due.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Payment Method Selection */}
            <section className="bg-surface-container-low p-8">
              <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`flex flex-col items-center justify-center p-4 border-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-primary bg-surface-container-lowest'
                      : 'border-transparent hover:border-outline-variant bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined mb-2">credit_card</span>
                  <span className={`text-xs font-bold ${paymentMethod === 'credit_card' ? '' : 'text-on-surface-variant'}`}>Credit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-primary bg-surface-container-lowest'
                      : 'border-transparent hover:border-outline-variant bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined mb-2">account_balance</span>
                  <span className={`text-xs font-bold ${paymentMethod === 'bank_transfer' ? '' : 'text-on-surface-variant'}`}>Bank Transfer</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Card Form & History */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-12">
            {/* Payment Form */}
            <section className="bg-surface-container-lowest p-10 shadow-[0_8px_24px_rgba(26,28,28,0.04)] relative">
              <h2 className="text-2xl font-black tracking-tight mb-8">Complete Payment</h2>
              
              {paymentMethod === 'bank_transfer' ? (
                <div className="space-y-6">
                  <div className="bg-surface-container p-6 border border-outline-variant/20">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">Transfer Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Method:</p>
                        <p className="text-lg font-bold">{paymentSettings.payment_transfer_method}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant mb-1">Account Details:</p>
                        <p className="text-lg font-mono font-bold">{paymentSettings.payment_transfer_details}</p>
                      </div>
                      <div className="pt-4 border-t border-outline-variant/20">
                        <p className="text-xs text-on-surface-variant">Please use your apartment number as the payment reference.</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Payment instructions noted. Please complete the transfer and contact management.')}
                    className="w-full bg-primary text-on-primary py-4 font-bold tracking-widest text-xs uppercase hover:bg-primary-container transition-all"
                  >
                    I Understand
                  </button>
                </div>
              ) : (
              <form onSubmit={handlePayment} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cardholder Name</label>
                    <input
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 text-sm font-medium transition-all placeholder:text-surface-dim"
                      placeholder="ALEXANDER RESIDENT"
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Card Number</label>
                    <input
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 text-sm font-medium transition-all placeholder:text-surface-dim"
                      placeholder="0000 0000 0000 0000"
                      type="text"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Expiry Date</label>
                    <input
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 text-sm font-medium transition-all placeholder:text-surface-dim"
                      placeholder="MM / YY"
                      type="text"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">CVV</label>
                    <input
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 text-sm font-medium transition-all placeholder:text-surface-dim"
                      placeholder="000"
                      type="text"
                    />
                  </div>
                  <div className="col-span-1 flex items-end justify-end">
                    <div className="flex gap-2">
                      <span className="material-symbols-outlined text-outline-variant">payment</span>
                      <span className="material-symbols-outlined text-outline-variant">account_balance_wallet</span>
                    </div>
                  </div>
                </div>
                <div className="pt-8">
                  <button
                    type="submit"
                    className="group relative w-full overflow-hidden bg-primary text-on-primary py-4 font-bold tracking-widest text-xs uppercase flex items-center justify-center gap-3 hover:bg-primary-container transition-all duration-300"
                  >
                    Confirm Transaction (${totalAmount.toFixed(2)})
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                  <p className="text-[10px] text-center mt-4 text-on-surface-variant font-medium tracking-tight">Secured by ASYS Architectural Core Protocol</p>
                </div>
              </form>
              )}
            </section>

            {/* Payment History Table */}
            <section className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-on-surface-variant">Recent Payment History</h3>
                <button className="text-[10px] font-bold border-b border-primary hover:text-on-surface-variant hover:border-surface-dim transition-colors">EXPORT ALL</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-left border-b border-surface-container">
                      <th className="pb-4 font-bold">Transaction ID</th>
                      <th className="pb-4 font-bold">Date</th>
                      <th className="pb-4 font-bold">Description</th>
                      <th className="pb-4 font-bold">Amount</th>
                      <th className="pb-4 font-bold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-6 text-sm font-medium">#{payment.id}</td>
                        <td className="py-6 text-sm text-on-surface-variant">{payment.date}</td>
                        <td className="py-6 text-sm">{payment.description}</td>
                        <td className="py-6 text-sm font-bold">${payment.amount.toFixed(2)}</td>
                        <td className="py-6 text-right">
                          <button className="p-2 hover:bg-surface-container-highest transition-all">
                            <span className="material-symbols-outlined text-xl">download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DuesPayment;
