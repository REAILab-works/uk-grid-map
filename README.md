# GB Grid Queue Map

**594.6 GW is waiting to connect to Great Britain's transmission grid. Only 81.8 GW is connected today.**

An interactive map of the NESO Transmission Entry Capacity (TEC) register: every project in the connection queue, placed on the substation it is waiting for.

**Live site: https://reailab-works.github.io/uk-grid-map/**

英国输电网并网排队地图：594.6 GW 在排队，目前已并网只有 81.8 GW。网页支持中文（右上角切换），点左上角的 "30 秒看懂" 有 6 步导览。

## What you can do

- Press the 30-second tour: six steps that fly to the numbers worth knowing (queue vs connected, what is actually under construction, batteries, one developer's 18 GW, the longest queue, offshore wind).
- - Click any circle to see the projects behind it, their status and contracted year, plus the 400 kV and 275 kV circuits at that substation.
  - - Filter by technology, project status or contracted year, or press play to watch the queue build up year by year.
    - - Search by substation, project or developer.
     
      - ## Data
     
      - - Queue: [NESO TEC register](https://www.neso.energy/data-portal/transmission-entry-capacity-tec-register), snapshot of 19 November 2026 (NESO Open Data Licence). 2,186 entries, of which 1,795 are queued (594,620 MW) and the rest are connected (81,774 MW).
        - - Substation locations: OpenStreetMap (ODbL), matched by name. Fallbacks: PyPSA-GB ETYS coordinates (MIT), FES 2025 GSP centroids and Nominatim place lookups.
          - - Circuits: NESO ETYS 2024 Appendix B, via [PyPSA-GB](https://github.com/andrewlyden/PyPSA-GB) (MIT). 441 links at 400 kV and 275 kV.
           
            - ## Read this before quoting a number
           
            - - 84% of the queued MW is placed on the map. The rest could not be matched to a location and is still counted in the headline total.
              - - Dashed rings are planned connection nodes with no substation yet. Their position is an approximate area.
                - - Circuits are drawn as straight lines between substations. They show which substations connect, not the real route.
                  - - The moving light on 400 kV lines is decoration. It does not show power flow.
                    - - Technology groups are my own simplification of the TEC plant types. Hybrids are assigned to one group (offshore wind first, then onshore wind, then solar + storage, then storage).
                      - - Status comes straight from the register. Scoping means an early-stage entry, not a project with consent.
                       
                        - ## Run it locally
                       
                        - No build step. Open index.html in a browser. The data is embedded as data/tec.js and data/substations.js, so the page makes no calls to NESO when it loads. Map tiles (Esri), Leaflet and fonts load from their CDNs.
                       
                        - To update the data, replace the rows in data/tec.js with a newer TEC register export.
                       
                        - ## Credits
                       
                        - Data: NESO, OpenStreetMap contributors, PyPSA-GB, Esri. Built with Leaflet.
                       
                        - An independent project. It is not affiliated with NESO or any network operator.
                        - 
