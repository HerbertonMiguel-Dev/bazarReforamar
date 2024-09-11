import { ChangeEvent, useState, useContext } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/panelheader";

import { FiUpload, FiTrash } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { Input } from '../../../components/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'

import { storage,db } from '../../../services/firebaseConnection'

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'

const schema = z.object({
  name: z.string().nonempty("O campo Produto é obrigatório"),
  categoria: z.string().nonempty("A categoria é obrigatório"),
  medqua: z.string().nonempty("O tamanho ou pagamento do produto é obrigatório"),
  forpag: z.string().nonempty("forma de pagamento é obrigatório"),
  price: z.string().nonempty("O preço é obrigatório"),
  whatsapp: z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value), {
    message: "Numero de telefone invalido."
  }),
  description: z.string().nonempty("A descrição é obrigatória")
})

type FormData = z.infer<typeof schema>;

interface ImageItemProps{
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}


export function New() {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  const [proImages, setProdImages] = useState<ImageItemProps[]>([])


  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
      const image = e.target.files[0]

      if(image.type === 'image/jpeg' || image.type === 'image/png'){
        await handleUpload(image)
      }else{
        alert("Envie uma imagem jpeg ou png!")
        return;
      }


    }
  }

  async function handleUpload(image: File){
    if(!user?.uid){
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

    uploadBytes(uploadRef, image)
    .then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadUrl) => {
          const imageItem = {
            name: uidImage,
            uid: currentUid,
            previewUrl: URL.createObjectURL(image),
            url: downloadUrl,
          }

          setProdImages((images) => [...images, imageItem] )


        })
    })

  }

  function onSubmit(data: FormData){
    if(proImages.length === 0){
      alert("Envie alguma imagem deste carro!")
      return;
    }
    
    const prodListImages = proImages.map( pro => {
      return{
        uid: pro.uid,
        name: pro.name,
        url: pro.url
      }
    })

    addDoc(collection(db, "produtos"), {
      name: data.name,
      categoria: data.categoria,
      whatsapp: data.whatsapp,
      medqua: data.medqua,
      forpag: data.forpag,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: prodListImages,
    })
    .then(() => {
      reset();
      setProdImages([]);
      console.log("CADASTRADO COM SUCESSO!");
    })
    .catch((error) => {
      console.log(error)
      console.log("ERRO AO CADASTRAR NO BANCO")
    })
  }

  async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`;

    const imageRef = ref(storage, imagePath);

    try{
      await deleteObject(imageRef)
      setProdImages(proImages.filter((car) => car.url !== item.url))
    }catch(err){
      console.log("ERRO AO DELETAR")
    }



  }


  return (
    <Container>
      <DashboardHeader/>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
        <button className="border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48">
          <div className="absolute cursor-pointer">
            <FiUpload size={30} color="#000" />
          </div>
          <div className="cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              className="opacity-0 cursor-pointer" 
              onChange={handleFile} 
            />
          </div>
        </button>

        {proImages.map( item => (
          <div key={item.name} className="w-full h-32 flex items-center justify-center relative">
            <button className="absolute" onClick={() => handleDeleteImage(item) }>
              <FiTrash size={28} color="#FFF" />
            </button>
            <img
              src={item.previewUrl}
              className="rounded-lg w-full h-32 object-cover"
              alt="Foto do carro"
            />
          </div>
        ))}
      </div>

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
        <form
          className="w-full"
          onSubmit={handleSubmit(onSubmit)}  
        >
          <div className="mb-3">
            <p className="mb-2 font-medium">Produto</p>
            <Input
              type="text"
              register={register}
              name="name"
              error={errors.name?.message}
              placeholder="Ex: Almofada.."
            />
          </div>

          <div className="mb-3">
            <p className="mb-2 font-medium">Categoria</p>
            <Input
              type="text"
              register={register}
              name="categoria"
              error={errors.categoria?.message}
              placeholder="Ex: Decoração"
            />
          </div>

          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Medida/Quantidade</p>
              <Input
                type="text"
                register={register}
                name="medqua"
                error={errors.medqua?.message}
                placeholder="Ex: 1 unidade.."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">FORMA DE PAGAMENTO</p>
              <Input
                type="text"
                register={register}
                name="forpag"
                error={errors.forpag?.message}
                placeholder="Pix/Dinheiro/Cartão."
              />
            </div>

          </div>


          <div className="flex w-full mb-3 flex-row items-center gap-4">
            <div className="w-full">
              <p className="mb-2 font-medium">Telefone / Whatsapp</p>
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 011999101923..."
              />
            </div>

            <div className="w-full">
              <p className="mb-2 font-medium">Preço</p>
              <Input
                type="text"
                register={register}
                name="price"
                error={errors.price?.message}
                placeholder="Ex: R$5,00"
              />
            </div>

          </div>

          

          <div className="mb-3">
            <p className="mb-2 font-medium">Descrição</p>
            <textarea
              className="border-2 w-full rounded-md h-24 px-2"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa sobre o carro..."
            />
            {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
          </div>

          <button type="submit" className="w-full rounded-md bg-zinc-900 text-white font-medium h-10">
            Cadastrar
          </button>

        </form>
      </div>
    </Container>
  )
}