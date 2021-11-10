(async function () {
	//fetch connessioni from /connessioni
	const response = await fetch("/connessioni");
	let connessioni = await response.json();
	connessioni = connessioni.map(([partenza, arrivo, costo]) => (partenza < arrivo ? [partenza, arrivo, costo] : [arrivo, partenza, costo]));
	const partenza = "G";
	const adiacentiPartenza = getAdiacenti(partenza, connessioni)
		.map(([a, b, costo]) => [partenza == a ? b : a, partenza == a ? a : b, costo])
		.sort();
	const tabella1 = {};
	tabella1[partenza] = [0, "-"];
	for (const [partenza, arrivo, costo] of adiacentiPartenza) tabella1[partenza] = [costo, arrivo];
	const tabella2 = [];
	//[destinatario,...adiacenti]
	const tuttiNodi = [...new Set([...connessioni.map(([partenza]) => partenza), ...connessioni.map(([, arrivo]) => arrivo)])].sort();
	const creaRigaDx = generatorCreaRiga();
	creaRigaDx.next();
	creaRigaDx.next("Destinatario");
	for (const adiacentePartenza of adiacentiPartenza) creaRigaDx.next(adiacentePartenza[0]);
	const tabellaHTML = document.createElement("table");
	$("#tabellaDx").children().filter("thead").append(creaRigaDx.next("fine").value);
	for (const nodo of tuttiNodi) {
		//Colonna "Destinatario tabella 2"
		//Ciclo i nodi adiacenti alla partenza per creare la riga
		const riga = [];
		for (const [nPartenza, nArrivo] of adiacentiPartenza) {
			const dist = parti(nPartenza, nodo,connessioni);
			riga.push(dist);
		}
		tabella2[nodo] = riga;
	}

	const creaRigaSx = generatorCreaRiga();
	creaRigaSx.next();
	creaRigaSx.next("Destinatari");
	creaRigaSx.next("Distanza");
	creaRigaSx.next("Linea");
	$("#tabellaSx").children().filter("thead").append(creaRigaSx.next("fine").value);
	//Genero la tabella di sx
	for (const nodo of tuttiNodi) {
		if (nodo == "G") continue;
		//Calcolo la distanza minore tra i nodi adiacenti e il nodo
		let min;
		let lineaMinore;
		for (const adiacente of adiacentiPartenza) {
			const distanza = tabella1[adiacente[0]][0] + tabella2[nodo][adiacentiPartenza.indexOf(adiacente)];
			if (min == undefined || distanza < min) {
				min = distanza;
				lineaMinore = adiacente[0];
			}
		}
		tabella1[nodo] = [min, lineaMinore];
	}

	//Mostro le due tabelle
	//Tabella sx
	for (const destinatario of Object.keys(tabella1).sort()) {
		creaRigaSx.next(destinatario);
		creaRigaSx.next(tabella1[destinatario][0]);
		creaRigaSx.next(tabella1[destinatario][1]);
		$("#tabellaSx").children().filter("tbody").append(creaRigaSx.next("fine").value);
	}
	//Tabella dx
	for (const destinatario of Object.keys(tabella2).sort()) {
		creaRigaDx.next(destinatario);
		for (const distanza of tabella2[destinatario]) creaRigaDx.next(distanza);
		$("#tabellaDx").children().filter("tbody").append(creaRigaDx.next("fine").value);
	}
})();
function getAdiacenti(nodo, elenco, escludi = false) {
	return elenco.filter(([a, b]) => nodo == a || nodo == b).map(([a, b, costo]) => (!escludi ? [a, b, costo] : [a == nodo ? b : a, a == nodo ? a : b, costo]));
}

const presenteInPercorso = (percorso, nodo) => percorso.split("").find(p => p == nodo) !== undefined;
function muovi2(percorso, corrente, destinazione, totale,connessioni) {
	if (corrente === destinazione) return totale;
	if (presenteInPercorso(percorso, corrente)) return -1;
	const adiacenti = getAdiacenti(corrente, connessioni, true);
	let min;
	//Ciclo tutti i nodi adiacenti cercando di arrivare a destinazione
	for (const adiacente of adiacenti) {
		const ris = muovi2(percorso + corrente, adiacente[0], destinazione, (totale || 0) + adiacente[2],connessioni);
		//Se ris è uguale a -1 vuol dire che non sono arrivato. Provo con il prossimo nodo
		if (ris == -1) continue;
		//Se sono qui significa che ho un percorso valido. Controllo se è il migliore risultato
		min = min == undefined || ris < min ? ris : min;
	}
	return min || -1;
}
function parti(partenza, destinazione,connessioni) {
	if (partenza == destinazione) return 0;
	const adiacenti = getAdiacenti(partenza, connessioni, true);
	let min;
	for (const adiacente of adiacenti) {
		const ris = muovi2(partenza, adiacente[0], destinazione, adiacente[2],connessioni);
		if (ris < min || min == undefined) min = ris;
	}
	return min || -1;
}
function* generatorCreaRiga() {
	let testo;
	testo = yield "finto";
	let intestazione = true;
	while (true) {
		const riga = document.createElement("tr");
		while (testo !== "fine") {
			const colonna = document.createElement(intestazione ? "th" : "td");
			colonna.innerText = testo;
			riga.appendChild(colonna);
			testo = yield true;
		}
		testo = yield riga;
		intestazione = false;
	}
}
