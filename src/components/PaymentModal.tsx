import React, { useState } from 'react';
import { ProductItem, UserProfile } from '../types';
import { 
  X, Truck, ShieldCheck, CheckCircle2, CreditCard, 
  MapPin, Phone, RefreshCw, KeyRound, Sparkles 
} from 'lucide-react';

interface PaymentModalProps {
  product: ProductItem | null;
  user: UserProfile;
  onClose: () => void;
  onSuccess: (orderTitle: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  product,
  user,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'orange' | 'wave' | 'cash'>('orange');
  const [deliveryAddress, setDeliveryAddress] = useState(`${user?.quartier || 'Hamdallaye ACI'}, Rue 314`);
  const [userPhone, setUserPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'details' | 'otp' | 'confirmed'>('details');

  if (!product) return null;

  const deliveryFee = 1500;
  const total = product.price + deliveryFee;

  const handleInitiateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.twoFactorEnabled) {
      setStep('otp');
    } else {
      processPayment();
    }
  };

  const processPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('confirmed');
      setTimeout(() => {
        onSuccess(product.title);
        onClose();
      }, 1500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'details' && (
          <form onSubmit={handleInitiateOrder} className="space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00685f]">
                Validation de commande
              </span>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Livraison rapide
              </h3>
            </div>

            {/* Product summary card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
              <img
                src={product.image}
                alt={product.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{product.title}</h4>
                <p className="text-[11px] text-slate-500">{product.shopName} • {product.shopLocation}</p>
                <div className="text-xs font-black text-[#00685f] mt-0.5">
                  {product.price.toLocaleString()} FCFA
                </div>
              </div>
            </div>

            {/* Delivery address input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse de livraison à Bamako
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-[#fea619] absolute left-3" />
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Quartier, Rue, Repère..."
                  required
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:border-[#00685f] focus:outline-none"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mode de paiement
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('orange')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'orange'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 ring-2 ring-orange-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-orange-600">Orange</span>
                  <span className="text-[10px] text-slate-500">Money ML</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'wave'
                      ? 'border-sky-500 bg-sky-50 text-sky-950 ring-2 ring-sky-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-sky-600">Wave</span>
                  <span className="text-[10px] text-slate-500">0% frais</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-emerald-600">Espèces</span>
                  <span className="text-[10px] text-slate-500">Au livreur</span>
                </button>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Prix de l'article</span>
                <span>{product.price.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison rapide</span>
                <span>{deliveryFee.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-teal-200/70">
                <span>Total à régler</span>
                <span className="text-[#00685f]">{total.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#00685f] hover:bg-[#00574f] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Truck className="w-4 h-4 text-[#89f5e7]" />
              <span>Confirmer la commande ({total.toLocaleString()} F)</span>
            </button>
          </form>
        )}

        {/* 2FA Step */}
        {step === 'otp' && (
          <div className="text-center py-3 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#00685f] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Validation 2FA requise</h3>
            <p className="text-xs text-slate-600">
              Entrez le code SMS reçu au <strong>{userPhone}</strong> pour valider le paiement.
            </p>

            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Code (ex: 123456)"
              maxLength={6}
              className="w-44 h-12 text-center text-lg font-black tracking-widest rounded-xl border border-slate-300 mx-auto block focus:border-[#00685f] focus:outline-none"
            />

            <button
              type="button"
              onClick={processPayment}
              disabled={loading}
              className="w-full h-11 rounded-xl bg-[#00685f] text-white font-bold text-xs shadow-md hover:bg-[#00574f] flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirmer l'opération</span>}
            </button>
          </div>
        )}

        {/* Confirmed Step */}
        {step === 'confirmed' && (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Commande confirmée !</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Le coursier prend en charge votre colis à la boutique en livraison rapide. Suivi actif dans votre onglet Profil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
