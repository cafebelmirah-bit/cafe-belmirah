import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { loginAdmin } from '../lib/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  
  const onSubmit = async (data: any) => {
    try {
      const res = await loginAdmin({ ...data, email: data.email.trim() });
      if (res.success) {
        localStorage.setItem('admin_token', res.token);
        toast.success('Logged in successfully');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-cream mb-2">Admin Portal</h1>
          <div className="gold-divider mx-auto" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Email</label>
            <input {...register('email', { required: true })} className="luxury-input w-full" type="email" placeholder="admin@cafebelmirah.com" />
          </div>
          <div>
            <label className="block font-body text-xs text-cream/50 tracking-wider uppercase mb-2">Password</label>
            <input {...register('password', { required: true })} className="luxury-input w-full" type="password" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full justify-center py-3 mt-4">
            {isSubmitting ? 'Logging in...' : 'Enter Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
