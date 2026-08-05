import { useState, FormEvent } from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutComplete: (customerName: string, address: string, items: CartItem[], total: number) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
}: CartDrawerProps) {
  // Checkout flow state: 'cart' | 'form' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart');
  
  // Checkout Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerZip, setCustomerZip] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  
  // Created message store
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappText, setWhatsappText] = useState('');

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleNextStep = () => {
    if (cartItems.length === 0) return;
    setCheckoutStep('form');
  };

  const handleBackToCart = () => {
    setCheckoutStep('cart');
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerState.trim() || !customerCity.trim() || !customerZip.trim() || !customerStreet.trim() || !customerNumber.trim()) return;

    const fullAddress = `${customerStreet}, ${customerNumber} - ${customerCity}/${customerState} - CEP: ${customerZip}`;

    // 1. Build the WhatsApp formatted message
    let messageText = `Olá! Meu nome é ${customerName} e vim pelo site de vocês!\n\n`;
    messageText += `Tenho interesse nos seguintes itens:\n`;
    
    cartItems.forEach(item => {
      messageText += `- ${item.quantity}x ${item.product.name}\n`;
    });
    
    messageText += `\nMeu endereço completo é:\nRua: ${customerStreet}, Nº ${customerNumber}\nCidade: ${customerCity} - ${customerState}\nCEP: ${customerZip}\n\n`;
    messageText += `Poderia me passar um orçamento do meu pedido?`;

    const encodedText = encodeURIComponent(messageText);
    const mockPhoneNumber = '5515981579514'; // Ideal placeholder number for client's business
    const finalUrl = `https://api.whatsapp.com/send?phone=${mockPhoneNumber}&text=${encodedText}`;

    setWhatsappText(messageText);
    setWhatsappUrl(finalUrl);

    // 2. Trigger parent simulation order logs
    onCheckoutComplete(customerName, fullAddress, cartItems, totalPrice);
    
    // 3. Set success state
    setCheckoutStep('success');
  };

  const handleCloseAndReset = () => {
    onClose();
    // small timeout to let animation finish before changing step back
    setTimeout(() => {
      setCheckoutStep('cart');
      setCustomerName('');
      setCustomerState('');
      setCustomerCity('');
      setCustomerZip('');
      setCustomerStreet('');
      setCustomerNumber('');
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAndReset}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-dark-card border-l border-white/10 p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(0,240,255,0.15)]"
          >
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-neon-blue" />
                <h3 className="font-display font-bold text-white text-base">Seu Carrinho Geek</h3>
              </div>
              <button
                id="cart-close-btn"
                onClick={handleCloseAndReset}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* STEP 1: CART LIST VIEW */}
            {checkoutStep === 'cart' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                
                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                      <div className="text-4xl">🛒</div>
                      <h4 className="font-display font-bold text-gray-300 text-sm">Seu carrinho está vazio!</h4>
                      <p className="text-xs text-gray-500 max-w-[240px]">
                        Navegue pela nossa vitrine e adicione Funkos e Action Figures para simular a compra.
                      </p>
                      <button 
                        onClick={() => {
                          onClose();
                          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue font-display text-xs font-bold uppercase tracking-wider"
                      >
                        Voltar à Vitrine
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        id={`cart-item-${item.product.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-dark-bg/60 border border-white/5 gap-3"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt=""
                          className="h-12 w-12 object-cover rounded-lg bg-dark-card border border-white/5"
                        />
                        
                        <div className="flex-1 space-y-1">
                          <h4 className="font-display font-bold text-white text-xs line-clamp-1">{item.product.name}</h4>
                          <span className="font-mono text-xs font-bold text-neon-blue">
                            R$ {item.product.price.toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1.5 bg-dark-card border border-white/10 rounded-lg p-0.5">
                          <button
                            id={`qty-dec-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-bold text-white w-5 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            id={`qty-inc-${item.product.id}`}
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Delete btn */}
                        <button
                          id={`qty-del-${item.product.id}`}
                          onClick={() => onRemoveItem(item.product.id)}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Checkout details */}
                {cartItems.length > 0 && (
                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Subtotal</span>
                      <span className="text-xl font-black text-white font-mono">
                        R$ <span className="text-neon-pink glow-pink">{totalPrice.toFixed(2)}</span>
                      </span>
                    </div>

                    <button
                      id="cart-checkout-step"
                      onClick={handleNextStep}
                      className="w-full py-3.5 bg-neon-blue text-dark-bg font-display text-sm font-black uppercase tracking-wider rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all cursor-pointer"
                    >
                      Continuar Pedido
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* STEP 2: DETAILS CUSTOMER FORM */}
            {checkoutStep === 'form' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto py-4 space-y-6">
                  
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-neon-blue/5 border border-neon-blue/20">
                      <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-neon-blue mb-1">Passo Final de Fechamento</h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Insira seus dados para simularmos a criação do seu log de pedido no painel de administração e criar o atalho de conversação para o WhatsApp da Baby Games.
                      </p>
                    </div>

                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 uppercase tracking-wider font-mono">Nome Completo *</label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="Ex: Marcus Vinícius"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue"
                      />
                    </div>

                    {/* Address inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">CEP *</label>
                        <input
                          type="text" required
                          placeholder="Ex: 01001-000"
                          value={customerZip}
                          onChange={(e) => setCustomerZip(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Estado *</label>
                        <input
                          type="text" required
                          placeholder="Ex: SP"
                          value={customerState}
                          onChange={(e) => setCustomerState(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Cidade *</label>
                      <input
                        type="text" required
                        placeholder="Ex: São Paulo"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Rua *</label>
                        <input
                          type="text" required
                          placeholder="Ex: Rua das Flores"
                          value={customerStreet}
                          onChange={(e) => setCustomerStreet(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Número *</label>
                        <input
                          type="text" required
                          placeholder="Ex: 123"
                          value={customerNumber}
                          onChange={(e) => setCustomerNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neon-blue"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Totalizadores de Produtos</span>
                      <span className="font-mono font-bold text-white">R$ {totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleBackToCart}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-display text-xs font-bold uppercase hover:bg-white/10 transition-all cursor-pointer"
                      >
                        Voltar
                      </button>

                      <button
                        id="checkout-submit"
                        type="submit"
                        className="flex-1 py-3 bg-neon-pink text-white font-display text-xs font-black uppercase tracking-wider rounded-xl hover:bg-neon-pink/80 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Send className="h-4 w-4 animate-pulse" />
                        <span>Gerar Pedido WhatsApp</span>
                      </button>
                    </div>
                  </div>

                </form>
              </div>
            )}

            {/* STEP 3: SUCCESS REDIRECT VIEW */}
            {checkoutStep === 'success' && (
              <div className="flex-1 flex flex-col justify-between py-6">
                
                <div className="text-center space-y-4 py-6">
                  <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-display font-black text-white text-lg uppercase tracking-tight">Pedido Simulado Registrado!</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    Excelente! O pedido foi registrado com sucesso em nosso painel administrativo local (vá na aba "Pedidos Whats" no Painel Admin para verificar!).
                  </p>
                </div>

                {/* Message preview area */}
                <div className="p-4 rounded-xl bg-dark-bg/80 border border-white/5 text-left space-y-2 max-h-[180px] overflow-y-auto">
                  <span className="text-[10px] font-mono text-neon-blue uppercase tracking-widest block border-b border-white/5 pb-1 mb-1">Prévia da Mensagem Gerada:</span>
                  <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {whatsappText}
                  </pre>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <a
                    id="whatsapp-redirect-link"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-display text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send className="h-4.5 w-4.5" />
                    <span>Enviar para WhatsApp</span>
                  </a>

                  <button
                    onClick={handleCloseAndReset}
                    className="w-full py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Fechar & Continuar Comprando
                  </button>
                </div>

              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
