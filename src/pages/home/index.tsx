import { useState, useEffect } from "react";
import { Container } from "../../components/container";
import { Link } from "react-router-dom";
import { collection, query, getDocs, orderBy,where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

interface ProdsProps {
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

export function Home() {
  const [prods, setProds] = useState<ProdsProps[]>([]);
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState("")

  useEffect(() => {
    loadProds();
  }, []);

  function loadProds() {
      const prodsRef = collection(db, "produtos");
      const queryRef = query(prodsRef, orderBy("created", "desc"));

      getDocs(queryRef).then((snapshot) => {
        let listprods = [] as ProdsProps[];

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
      });
    }

  function handleImageLoad(id: string){
    setLoadImages((prevImageLoaded) => [...prevImageLoaded, id])
  }

  async function handleSearchProd(){
    if(input === ''){
      loadProds();
      return;
    }

    setProds([]);
    setLoadImages([]);

    const q = query(collection(db, "produtos"), 
    where("name", ">=", input.toUpperCase()),
    where("name", "<=", input.toUpperCase() + "\uf8ff")
    )

    const querySnapshot = await getDocs(q)

    let listprods = [] as ProdsProps[];

    querySnapshot.forEach((doc) => {
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
      })
    })

   setProds(listprods);

  }

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2">
        <input
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          placeholder="Digite o nome do Produto..."
          value={input}
          onChange={ (e) => setInput(e.target.value) }
        />
        <button 
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-medium text-lg"
          onClick={handleSearchProd}
        >
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center mt-6 text-2xl mb-4">
        Produtos novos e usados
      </h1>

      <main className="grid gird-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

        {prods.map((prod) => (
          <Link to={`/prod/${prod.id}`} key={prod.id}>
            <section  className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadImages.includes(prod.id) ? "none" : "block" }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={prod.images[0].url}
                alt="produto"
                onLoad={ () => handleImageLoad(prod.id) }
                style={{ display: loadImages.includes(prod.id) ? "block" : "none" }}
              />
              <p className="font-bold mt-1 mb-2 px-2">{prod.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">{prod.categoria}</span>
                <strong className="text-black font-medium text-xl">R$
                  {prod.price} 
                  <span className="text-sm text-zinc-500 font-normal ml-2">{prod.forpag}</span>
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-black">{prod.description}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  );
}
