const photo = (name) => `${import.meta.env.BASE_URL}photos/${name}`;

const chapters = [
  {
    id: "circo",
    src: photo("01-circo.jpg"),
    width: 1024,
    height: 772,
    alt: "Mamá y dos niños sentados juntos en sillas rojas, en una visita al circo.",
    text: "Una visita al circo",
  },
  {
    id: "campamento",
    src: photo("02-campamento.png"),
    width: 640,
    height: 480,
    alt: "Mamá con sus dos hijos bajo un portal, en la despedida hacia un campamento.",
    text: "La despedida hacia un campamento",
  },
  {
    id: "domingo",
    src: photo("03-domingo.jpg"),
    width: 1024,
    height: 768,
    alt: "La familia reunida junto a una pared, un domingo después de la iglesia.",
    text: "Calor familiar un domingo después de la iglesia",
  },
  {
    id: "promocion",
    src: photo("04-promocion.jpg"),
    width: 1024,
    height: 768,
    alt: "Un niño con toga de graduación, entre mamá y su hermana.",
    text: "La emoción de una promoción",
  },
  {
    id: "zoologico",
    src: photo("05-zoologico.jpg"),
    width: 1024,
    height: 768,
    alt: "Mamá y sus dos hijos sentados en una banca del zoológico.",
    text: "Estar en el zoológico buscando elefantes (según yo, sí habían en Nicaragua)",
  },
  {
    id: "asado",
    src: photo("06-asado.jpg"),
    width: 1000,
    height: 750,
    alt: "Mamá con sus hijos, en el asado de los quince años.",
    text: "Un asado celebrando los 15 años de su hijo favorito",
  },
  {
    id: "diciembre",
    src: photo("07-diciembre.jpg"),
    width: 1024,
    height: 768,
    alt: "La familia reunida en casa, en una reunión de diciembre.",
    text: "Las típicas reuniones familiares en diciembre",
  },
  {
    id: "antes",
    src: photo("08-antes.jpg"),
    width: 1024,
    height: 460,
    alt: "La familia en una mesa al aire libre, unos días antes de una partida.",
    text: "Unos días antes de irte…",
  },
];

export default chapters;
