import { useEffect, useState, useContext  } from 'react'
import { Container } from "../../components/container";
import { DashboardHeader } from '../../components/panelheader'

import { FiTrash2 } from 'react-icons/fi'

import { collection, getDocs, where, query, doc, deleteDoc } from 'firebase/firestore'
import { db, storage } from '../../services/firebaseConnection'
import { ref, deleteObject } from 'firebase/storage'
import { AuthContext } from '../../contexts/AuthContext'

interface ProdProps {
  id: string;
  name: string;
  categoria: string;
  uid: string;
  price: string | number;
  medqua: string;
  description: string;
  forpag: string;
  images: ProdImageProps[];
}

interface ProdImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [prods, setProds] = useState<ProdProps[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    function loadProds() {
      if(!user?.uid){
        return;
    }

    const prodsRef = collection(db, "produtos");
    const queryRef = query(prodsRef, where("uid", "==", user.uid))

    getDocs(queryRef)
    .then((snapshot) => {
      let listprods = [] as ProdProps[];

      snapshot.forEach((doc) => {
          listprods.push({
            id: doc.id,
            name: doc.data().name,
            categoria: doc.data().categoria,
            medqua: doc.data().medqua,
            description: doc.data().description,
            forpag: doc.data().forpag,
            price: doc.data().price,
            images: doc.data().images,
            uid: doc.data().uid,
          });
        });
        setProds(listprods);
        console.log(listprods);
    })
  }

    loadProds();
  }, [user])

  async function handleDeletePro(prod: ProdProps){
    const itemProd = prod;

    const docRef = doc(db, "produtos", itemProd.id)
    await deleteDoc(docRef);

    itemProd.images.map( async (image) => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)

      try{
        await deleteObject(imageRef)
        setProds(prods.filter(prod => prod.id !== itemProd.id))

    }catch(err){
        console.log("ERRO AO EXCLUIR ESSA IMAGEM")
    }
    })
  }

  return (
    <Container>
      <DashboardHeader/>

      <main className="grid gird-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

      {prods.map(prod => (

        <section key={prod.id} className="w-full bg-white rounded-lg relative">
          <button 
          onClick={ () => handleDeletePro(prod) }
          className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow"
          >
            <FiTrash2 size={26} color="#000" />
          </button>

          <img
            className="w-full rounded-lg mb-2 max-h-50"
            src={prod.images[0].url}
          />
          <p className="font-bold mt-1 px-2 mb-2">{prod.name}</p>

          <div className="flex flex-col px-2">
            <span className="text-zinc-700">
              {prod.categoria}
            </span>
            <strong className="text-black font-bold mt-4">
              {prod.price} 
              <span className="text-sm text-zinc-500 font-normal ml-2">{prod.forpag}</span>
            </strong>
          </div>

          <div className="w-full h-px bg-slate-200 my-2"></div>
          <div className="px-2 pb-2">
            <span className="text-black">
              {prod.description}
            </span>
          </div>

        </section>
      ))}
        

      </main>
    </Container>
  )
}