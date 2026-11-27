# Prova de viabilitat · ofertes del Magatzem

Aquest prototip NO es el cercador definitiu i NO canvia inventari, fitxers del Magatzem, compres, preus historics ni envia avisos.

- Consulta **un cop al dia** una API publica de fullets, per a cinc noms de producte generics.
- La cerca fa servir **Barcelona** per evitar publicar un domicili o ubicacio personal.
- Registra el resultat i errors als logs de GitHub Actions. La primera execucio programada encara s'ha de validar en viu.
- **Tots els resultats son no aptes per alertes**: l'API no verifica ni transport, ni disponibilitat a la botiga, ni equivalencia exacta de variants, ni preu final.
- Zero compres i zero avisos comercials. Una execucio reeixida tan sols demostra accés i format de l'API, no una oferta verificada.
- A GitHub Actions > 'Prova autonoma ofertes - nomes lectura' es pot executar manualment, consultar el registre i desactivar l'horari.
- Compte: GitHub pot endarrerir/saltar execucions i desactivar cron despres de 60 dies sense activitat del repositori. No s'ha configurat un canal de notificacio personal.
- La font publica nomes ofertes de fullets, no preus habituals ni Amazon/Mercadona.

Font i condicions: https://quecomprar.org/conector/
