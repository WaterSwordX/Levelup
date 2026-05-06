import { useState } from 'react'
import { signUp, signIn } from '../sync'
import { Mail, Lock, LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  onAuthSuccess: () => void
}

export default function AuthPanel({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const fn = mode === 'login' ? signIn : signUp
      const result = await fn(email.trim(), password)

      if (result.error) {
        setError(result.error)
      } else if (mode === 'signup') {
        setMessage('注册成功！如果邮箱需要验证，请检查收件箱后登录。')
        setMode('login')
      } else {
        onAuthSuccess()
      }
    } catch {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card p-6 max-w-sm mx-auto">
      <h3
        className="text-lg font-bold text-center mb-1"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)' }}
      >
        {mode === 'login' ? '登录' : '注册'}
      </h3>
      <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
        {mode === 'login' ? '登录后数据将自动同步到云端' : '创建账号即可跨设备同步数据'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            邮箱
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field pl-10"
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            密码
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className="input-field pl-10"
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email.trim() || password.length < 6}
          className="btn-primary flex items-center gap-2 w-full justify-center py-2.5 text-sm"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : mode === 'login' ? (
            <LogIn size={16} />
          ) : (
            <UserPlus size={16} />
          )}
          {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>

      {/* Messages */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-xs mt-3 animate-fade-in"
          style={{ background: 'rgba(255, 107, 107, 0.08)', color: 'var(--coral)' }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      {message && (
        <div
          className="p-3 rounded-xl text-xs mt-3 animate-fade-in"
          style={{ background: 'rgba(78, 205, 196, 0.08)', color: 'var(--teal)' }}
        >
          {message}
        </div>
      )}

      {/* Toggle mode */}
      <div className="text-center mt-4">
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}
          className="text-xs transition-colors duration-200"
          style={{ color: 'var(--accent)' }}
        >
          {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
        </button>
      </div>
    </div>
  )
}
