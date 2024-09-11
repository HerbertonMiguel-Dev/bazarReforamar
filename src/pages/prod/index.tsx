import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { FaWhatsapp } from 'react-icons/fa'
import { useParams } from 'react-router-dom'

import { getDoc, doc, } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

interface ProdProps{
  id: string;
  name: string;
  categoria: string;
  uid: string;
  price: string | number;
  medqua: string;
  description: string;
  forpag: string;
  whatsapp: string;
  images: ProdImageProps[];

}

interface ProdImageProps {
  name: string;
  uid: string;
  url: string;
}

export function ProdDetail() {
  const { id } = useParams(); 
  const [prod, setProd] = useState<ProdProps>()

  useEffect(() => {
    async function loadProd(){
      if(!id){ return }

      const docRef = doc(db, "produtos", id)
      getDoc(docRef)
      .then((snapshot) => {
        setProd({
          id: snapshot.id,
          name: snapshot.data()?.name,
          categoria: snapshot.data()?.categoria,
          uid: snapshot.data()?.uid,
          price: snapshot.data()?.price,
          medqua: snapshot.data()?.medqua,
          description: snapshot.data()?.description,
          forpag: snapshot.data()?.forpag,
          whatsapp: snapshot.data()?.whatsapp,
          images: snapshot.data()?.images,
          
        })
      })
    }

    loadProd()

  }, [id])

  return (
    <Container>
      <h1>Pagina Detalhes</h1>

      { prod && (
      <main className="w-full bg-white rounded-lg p-6 my-4">
        <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
          <h1 className="font-bold text-3xl text-black">{prod?.name}</h1>
          <h1 className="font-bold text-3xl text-black">R$ {prod?.price}</h1>
        </div>
        <p>{prod?.categoria}</p>
        
        <div className="flex w-full gap-6 my-4">
          <div className="flex flex-col gap-4">
            <div>
              <p>Medida/Quantidade</p>
              <strong>{prod?.medqua}</strong>
            </div> 
            <div>
              <p>Forma de Pagamento</p>
              <strong>{prod?.forpag}</strong>
            </div> 
          </div>
          
        </div>

        <strong>Descrição:</strong>
        <p className="mb-4">{prod?.description}</p>
        

        <strong>Telefone / WhatsApp</strong>
        <p>{prod?.whatsapp}</p>

        <a
          className="cursor-pointer bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium"
        >
          Conversar com vendedor
          <FaWhatsapp size={26} color="#FFF" />
        </a>

      </main>
      )}
    </Container>
  )
}