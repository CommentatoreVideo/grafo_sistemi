//express server on port 3000
const express = require("express");
const app = express();
app.use(express.static("public"));
const server = app.listen(3000);
const { connessioni } = require("./connessioni.js");
app.get("/connessioni", (req, res) => {
	res.send(connessioni);
});
app.get("/nodi", (req, res) => {
	const dataMappa = {};
	dataMappa.header = {
		languages: ["undefined"],
		baseIris: ["http://schema.org", "http://www.w3.org/2000/01/rdf-schema", "http://www.w3.org/2003/01/geo/wgs84_pos", "http://purl.org/dc/terms", "http://www.w3.org/2001/XMLSchema", "http://xmlns.com/foaf/0.1", "http://www.w3.org/2000/10/swap/pim/contact", "http://www.w3.org/2004/02/skos/core"],
		prefixList: { owl: "http://www.w3.org/2002/07/owl#", rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#", wot: "http://xmlns.com/wot/0.1/", xsd: "http://www.w3.org/2001/XMLSchema#", dc: "http://purl.org/dc/elements/1.1/", xml: "http://www.w3.org/XML/1998/namespace", vs: "http://www.w3.org/2003/06/sw-vocab-status/ns#", foaf: "http://xmlns.com/foaf/0.1/", rdfs: "http://www.w3.org/2000/01/rdf-schema#" },
		title: { undefined: "Routing" },
		iri: "<br><center><span style='color:white'>Per aggiungere, modificare o eliminare collegamenti</span></center><br><center><a href='javascript:void(0)' onclick='entracollegamento()'><button>Entra in modalità collegamento</button></a></center><br>",
		description: { undefined: "Mappa nodi routing" },
		other: { title: [{ identifier: "title", language: "undefined", value: "Friend of a Friend (FOAF) vocabulary", type: "label" }] },
	};
	dataMappa.namespace = [];
	dataMappa.class = [];
	dataMappa.classAttribute = [];
	dataMappa.property = [];
	dataMappa.propertyAttribute = [];
	const nodi = [...new Set([...connessioni.map(connessione => connessione[0]), ...connessioni.map(connessione => connessione[1])])];
	let indice = nodi.length;
	for (const nodo of nodi) {
		dataMappa.class.push({
			id: nodi.indexOf(nodo),
			type: "rdfs:Datatype",
		});
		dataMappa.classAttribute.push({
			label: { "IRI-based": nodo },
			comment: { undefined: "Nessuna descrizione" },
			description: { undefined: "Nessun autore" },
			id: nodi.indexOf(nodo),
		});
	}
	for (const connessione of connessioni) {
		dataMappa.property.push({
			id: indice,
			type: "owl:ObjectProperty",
			label: {
				undefined: connessione[2] + "",
			},
		});

		dataMappa.propertyAttribute.push({
			range: nodi.indexOf(connessione[0]) + "", //id del nodo di arrivo della freccia
			domain: nodi.indexOf(connessione[1]) + "", //id del nodo di partenza della freccia
			attributes: ["object"],
			id: indice++, //id della freccia
		});
	}
	res.send(dataMappa);
});
