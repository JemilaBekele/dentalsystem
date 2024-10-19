import { useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPayment: number; // Accept the current payment amount
  receipt: boolean; // Prop to handle the receipt state
  onReceiptChange: (value: boolean) => void; // Function prop for receipt change
  onSubmit: () => void; // Confirm payment
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, currentPayment, receipt, onReceiptChange, onSubmit }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(); // Just confirm the payment
    onClose(); // Close the modal after submitting
  };

  useEffect(() => {
    // Reset the modal state when it opens if needed
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className=" fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">Confirm Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="currentPayment" className="block text-sm mb-2">Current Payment Amount</label>
            <input
              type="number"
              id="currentPayment"
              value={currentPayment}
              readOnly
              className="border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="receipt" className="block text-sm mb-2">Receipt</label>
            <input
              type="checkbox"
              id="receipt"
              checked={receipt}
              onChange={(e) => onReceiptChange(e.target.checked)}
              className="form-checkbox"
            />
          </div>
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;