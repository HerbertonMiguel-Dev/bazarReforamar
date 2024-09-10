
import { useEffect } from 'react'
import logoImg from '../../assets/logo.svg';
import googleIcon from '../../assets/google-icon.svg'; // ícone do Google
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '../../components/container';
import { Input } from '../../components/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Importar signInWithPopup do Firebase
import { auth, provider } from '../../services/firebaseConnection' // Importar auth e provider do Firebase

// Validação do formulário
const schema = z.object({
  email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
  password: z.string().nonempty("O campo senha é obrigatório")
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  useEffect(() => {
    async function handleLogout(){
      await signOut(auth)
    }

    handleLogout();
  }, [])

  // Função de login com o Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('Usuário logado com Google:', user);
      // Armazenar as informações do usuário no localStorage ou redirecionar
      localStorage.setItem('user', JSON.stringify(user));
      // Redirecionar para o dashboard
      window.location.href = '/dashboard'; // ou usar useNavigate do react-router-dom
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  // Função de login com email e senha (formulário)
  function onSubmit(data: FormData){
    signInWithEmailAndPassword(auth, data.email, data.password)
    .then((user) => {
      console.log("LOGADO COM SUCESSO!")
      console.log(user)
      navigate("/dashboard", { replace: true })
    })
    .catch(err => {
      console.log("ERRO AO LOGAR")
      console.log(err);
    })
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-xl w-full">
          <img
            src={logoImg}
            alt="Logo do site"
            className="w-full"
          />
        </Link>

        <form 
          className="bg-white max-w-xl w-full rounded-lg p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu email..."
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="password"
              placeholder="Digite sua senha..."
              name="password"
              error={errors.password?.message}
              register={register}
            />
          </div>

          <button type="submit" className="bg-zinc-900 w-full rounded-md text-white h-10 font-medium">
            Acessar
          </button>
        </form>

        <div className="w-full max-w-xl">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="bg-red-600 w-full rounded-md text-white h-10 font-medium flex items-center justify-center gap-2"
          >
            <img src={googleIcon} alt="Google Icon" className="w-5 h-5" />
            Entrar com Google
          </button>
        </div>

        <Link to="/register">
          Ainda não possui uma conta? Cadastre-se
        </Link>
      </div>
    </Container>
  );
}
