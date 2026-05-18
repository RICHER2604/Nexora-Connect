import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { Star, Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, Loader2, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'reset'
  const [resetStep, setResetStep] = useState('EMAIL') // 'EMAIL' | 'OTP' | 'PASSWORD'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    emailOrPhone: '',
    password: '',
    otp: '',
    newPassword: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (!form.fullName || !form.username || !form.emailOrPhone || !form.password) {
          toast.error('Please fill in all fields.')
          setLoading(false)
          return
        }
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
          fullName: form.fullName,
          username: form.username,
          emailOrPhone: form.emailOrPhone,
          password: form.password,
        })
        localStorage.setItem('nexora_token', res.data.token)
        localStorage.setItem('nexora_user', JSON.stringify(res.data.user))
        toast.success('Welcome to Nexora Connect! 🎉')
        navigate('/', { replace: true })
      } else if (mode === 'login') {
        if (!form.emailOrPhone || !form.password) {
          toast.error('Please fill in all fields.')
          setLoading(false)
          return
        }
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          emailOrPhone: form.emailOrPhone,
          password: form.password,
        })
        localStorage.setItem('nexora_token', res.data.token)
        localStorage.setItem('nexora_user', JSON.stringify(res.data.user))
        toast.success('Welcome back! 👋')
        navigate('/', { replace: true })
      } else if (mode === 'reset') {
        if (resetStep === 'EMAIL') {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email: form.emailOrPhone })
          toast.success(res.data.message)
          if (res.data.testOTP) {
            setForm(prev => ({ ...prev, otp: res.data.testOTP }))
            toast(`Dev Mode: OTP ${res.data.testOTP} auto-filled`, { icon: '🛠️' })
          }
          setResetStep('OTP')
        } else if (resetStep === 'OTP') {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email: form.emailOrPhone, otp: form.otp })
          toast.success('OTP verified!')
          setResetStep('PASSWORD')
        } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { 
            email: form.emailOrPhone, 
            otp: form.otp, 
            newPassword: form.newPassword 
          })
          toast.success('Password reset successful! Please login.')
          setMode('login')
          setResetStep('EMAIL')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setForm({ fullName: '', username: '', emailOrPhone: '', password: '', otp: '', newPassword: '' })
    setShowPassword(false)
    setResetStep('EMAIL')
  }

  return (
    <div className='min-h-screen flex relative overflow-hidden bg-[#0a0a1a] selection:bg-purple-500/30'>
      {/* Background Layer */}
      <div className='absolute inset-0 z-0 overflow-hidden'>
        <img src={assets.bgImage} alt='' className='absolute inset-0 w-full h-full object-cover opacity-40 scale-105' />
        <div className='absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e]/90 to-[#0a0a1a]' />
        
        {/* Dynamic Animated Blobs */}
        <div className='absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse duration-[10s]' />
        <div className='absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse duration-[8s] delay-1000' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] animate-pulse duration-[12s] delay-500' />
        
        {/* Floating Particles (CSS only) */}
        <div className='absolute inset-0 opacity-20 pointer-events-none'>
          <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping delay-700' />
          <div className='absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-1000' />
          <div className='absolute top-1/2 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300' />
        </div>
      </div>

      {/* Left Content: Hero Section */}
      <div className='hidden lg:flex flex-col flex-1 relative z-10 p-16 xl:p-24 justify-between'>
        {/* Branding */}
        <div className='flex items-center gap-3 group cursor-default'>
          <div className='p-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md group-hover:border-purple-500/50 transition-all duration-500 shadow-xl'>
            <img src={assets.logo} alt='Nexora Connect' className='h-10 w-10 object-contain group-hover:rotate-12 transition-transform' />
          </div>
          <span className='font-black text-3xl text-white tracking-tighter'>
            NEXORA<span className='text-purple-500'>Connect.</span>
          </span>
        </div>

        {/* Hero Body */}
        <div className='max-w-xl'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in'>
             <Sparkles size={14} className='text-purple-400' />
             <span className='text-xs font-bold text-white/80 uppercase tracking-widest'>The Future of Connection</span>
          </div>

          <h1 className='text-6xl xl:text-7xl font-black text-white leading-[1.1] mb-8'>
            More than just <br />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400'>
              Social Networking.
            </span>
          </h1>

          <p className='text-white/60 text-xl leading-relaxed font-medium mb-10'>
            Join a thriving community where every interaction matters. Experience a social space designed for meaningful growth and genuine discovery.
          </p>

          {/* Social Proof */}
          <div className='flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm w-fit'>
             <img src={assets.group_user} alt='' className='h-10 filter drop-shadow-md' />
             <div className='h-8 w-[1px] bg-white/10 mx-2' />
             <div>
                <div className='flex gap-0.5 mb-1'>
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} size={14} className='text-amber-400 fill-amber-400' />
                  ))}
                </div>
                <p className='text-white/80 text-sm font-bold'>10k+ <span className='text-white/40 font-medium'>active connectors</span></p>
             </div>
          </div>

          {/* Feature highlights */}
          <div className='grid grid-cols-2 gap-4 mt-12'>
             {[
               { icon: <Zap size={18}/>, text: 'Instant Sync', color: 'text-yellow-400' },
               { icon: <ShieldCheck size={18}/>, text: 'Encrypted', color: 'text-green-400' }
             ].map((item, idx) => (
               <div key={idx} className='flex items-center gap-3 text-white/70 hover:text-white transition-colors cursor-default'>
                  <span className={item.color}>{item.icon}</span>
                  <span className='text-sm font-bold tracking-wide uppercase'>{item.text}</span>
               </div>
             ))}
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <p className='text-white/30 text-xs font-medium uppercase tracking-widest'>© 2026 Nexora Global Inc.</p>
          <div className='flex gap-6'>
             <button className='text-white/30 hover:text-white/60 text-xs uppercase font-bold tracking-widest transition-colors'>Privacy</button>
             <button className='text-white/30 hover:text-white/60 text-xs uppercase font-bold tracking-widest transition-colors'>Terms</button>
          </div>
        </div>
      </div>

      {/* Right Content: Authentication Card */}
      <div className='flex-1 lg:max-w-[540px] flex items-center justify-center relative z-10 p-6 md:p-12'>
        <div className='w-full max-w-md animate-slide-up'>
          {/* Main Card */}
          <div className='bg-[#16162a]/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group'>
            
            {/* Subtle glow border effect */}
            <div className='absolute inset-0 border border-white/5 rounded-[40px] pointer-events-none' />
            <div className='absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700' />

            {/* Mobile Header */}
            <div className='lg:hidden flex items-center justify-center gap-2 mb-10'>
              <img src={assets.logo} alt='Nexora' className='h-8 w-8 object-contain' />
              <span className='font-black text-2xl text-white tracking-tighter'>NEXORA<span className='text-purple-500'>.</span></span>
            </div>

            {/* Form Header */}
            <div className='mb-10 text-center lg:text-left'>
              <h2 className='text-3xl font-black text-white mb-2 tracking-tight'>
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Get Started' : 'Reset Password'}
              </h2>
              <p className='text-white/50 text-sm font-medium'>
                {mode === 'login'
                  ? 'Access your Nexora universe'
                  : mode === 'signup'
                  ? 'Start your journey with our community'
                  : 'Recover your account access'}
              </p>
            </div>

            {/* Mode Switcher (Hide in Reset) */}
            {mode !== 'reset' && (
              <div className='flex bg-black/40 border border-white/5 rounded-[22px] p-1.5 mb-10 relative'>
                {['login', 'signup'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => switchMode(tab)}
                    className={`flex-1 py-3 rounded-[16px] text-sm font-black transition-all duration-500 relative z-10 ${
                      mode === tab ? 'text-[#0a0a1a]' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
                {/* Sliding Background */}
                <div 
                  className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-[16px] transition-all duration-500 ease-out shadow-xl ${
                    mode === 'signup' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {mode === 'signup' && (
                <div className='grid grid-cols-1 gap-4 animate-fade-in'>
                  <div className='relative group'>
                    <User className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors' />
                    <input
                      type='text'
                      name='fullName'
                      required
                      placeholder='Display Name'
                      value={form.fullName}
                      onChange={handleChange}
                      className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-sm'
                    />
                  </div>
                  <div className='relative group'>
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 text-sm font-bold transition-colors'>@</div>
                    <input
                      type='text'
                      name='username'
                      required
                      placeholder='username'
                      value={form.username}
                      onChange={handleChange}
                      className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-10 pr-4 outline-none transition-all font-medium text-sm'
                    />
                  </div>
                </div>
              )}

              {/* Email / OTP / Password inputs based on mode/step */}
              {(mode !== 'reset' || resetStep === 'EMAIL' || resetStep === 'OTP' || resetStep === 'PASSWORD') && (
                <div className='space-y-4 animate-fade-in'>
                  {(mode !== 'reset' || resetStep === 'EMAIL') && (
                    <div className='relative group'>
                      <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors' />
                      <input
                        type='text'
                        name='emailOrPhone'
                        required
                        placeholder={mode === 'reset' ? 'Enter Registered Email' : 'Email or Phone'}
                        value={form.emailOrPhone}
                        onChange={handleChange}
                        className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-sm'
                      />
                    </div>
                  )}

                  {mode === 'reset' && resetStep === 'OTP' && (
                    <div className='relative group animate-fade-in'>
                      <Zap className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors' />
                      <input
                        type='text'
                        name='otp'
                        required
                        placeholder='Enter 6-digit OTP'
                        value={form.otp}
                        onChange={handleChange}
                        className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-sm'
                      />
                    </div>
                  )}

                  {mode === 'reset' && resetStep === 'PASSWORD' && (
                    <div className='relative group animate-fade-in'>
                      <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors' />
                      <input
                        type='password'
                        name='newPassword'
                        required
                        placeholder='Enter New Password'
                        value={form.newPassword}
                        onChange={handleChange}
                        className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-medium text-sm'
                      />
                    </div>
                  )}

                  {mode !== 'reset' && (
                    <div className='relative group'>
                      <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors' />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        required
                        placeholder='Password'
                        value={form.password}
                        onChange={handleChange}
                        className='w-full bg-black/20 border border-white/5 focus:border-purple-500/50 focus:bg-black/40 text-white placeholder:text-white/20 rounded-2xl py-4 pl-12 pr-12 outline-none transition-all font-medium text-sm'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-purple-400 transition-colors'
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <div className='flex justify-end px-1'>
                  <button 
                    onClick={() => setMode('reset')}
                    type='button' 
                    className='text-[11px] font-bold text-white/30 hover:text-purple-400 uppercase tracking-widest transition-colors'
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type='submit'
                disabled={loading}
                className='w-full group/btn relative mt-4 h-14 bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 active:scale-95'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500' />
                <div className='relative flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider text-[#0a0a1a] group-hover/btn:text-white transition-colors duration-500'>
                  {loading ? (
                    <Loader2 className='w-5 h-5 animate-spin' />
                  ) : (
                    <>
                      <span>
                        {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Join Now' : resetStep === 'EMAIL' ? 'Send OTP' : resetStep === 'OTP' ? 'Verify OTP' : 'Update Password'}
                      </span>
                      <ArrowRight size={18} className='group-hover/btn:translate-x-1 transition-transform' />
                    </>
                  )}
                </div>
              </button>

              {mode === 'reset' && (
                <button 
                  onClick={() => switchMode('login')}
                  type='button' 
                  className='w-full text-center text-xs font-bold text-white/20 hover:text-white transition-colors mt-4 uppercase tracking-widest'
                >
                  Back to login
                </button>
              )}
            </form>

            {/* Footer Links */}
            <div className='mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-6'>
               <div className='flex items-center gap-4'>
                  <div className='h-[1px] w-8 bg-white/10' />
                  <span className='text-[10px] font-bold text-white/20 uppercase tracking-widest'>Secure Session</span>
                  <div className='h-[1px] w-8 bg-white/10' />
               </div>
               
               <p className='text-white/40 text-xs font-medium'>
                {mode === 'login' ? "New to Nexora? " : mode === 'signup' ? "Joined us before? " : "Know your password? "}
                <button
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className='text-white hover:text-purple-400 font-black transition-colors underline decoration-purple-500/30 underline-offset-4'
                >
                  {mode === 'login' ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Login