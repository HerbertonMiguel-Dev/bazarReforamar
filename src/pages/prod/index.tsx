import { useEffect, useState } from 'react'
import { Container } from '../../components/container'
import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { getDoc, doc, } from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

import { Swiper, SwiperSlide } from 'swiper/react'

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
  const [sliderPerView, setSliderPerView] = useState<number>(2);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProd(){
      if(!id){ return }

      const docRef = doc(db, "produtos", id)
      getDoc(docRef)
      .then((snapshot) => {

        if(!snapshot.data()){
          navigate("/")
        }

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

  useEffect(() => {

    function handleResize(){
      if(window.innerWidth < 720){
        setSliderPerView(1);
      }else{
        setSliderPerView(2);
      }
    }

    handleResize();

    window.addEventListener("resize", handleResize)

    return() => {
      window.removeEventListener("resize", handleResize)
    }

  }, [])

  return (
    <Container>

      {prod && (
          <Swiper
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
        >
          {prod?.images.map( image => (
            <SwiperSlide key={image.name}>
              <img
                src={image.url}
                className="w-3/4 max-h-96 object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      

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
          href={`https://api.whatsapp.com/send?phone=${prod?.whatsapp}&text=Olá vi esse ${prod?.name} no valor  ${prod?.price}de no site Bazar ReforAmar e fique interessado!`}
          target="_blank"
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