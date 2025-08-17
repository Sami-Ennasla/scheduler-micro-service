#  Scalability – Scheduler Microservice

##  Doel

De scheduler microservice moet meegroeien tot een setup die **10.000 gebruikers wereldwijd**, **1.000 services** en ongeveer **6.000 requests per minuut** kan verwerken, zonder dat de performance daar onder lijdt.

---

## 🏗️ Hoe we dit aanpakken

### 1. Database

* **Connection pooling (pgBouncer)** zodat we niet te veel losse connecties naar Postgres openen.
* **Read replicas** om reads en writes te scheiden.
* **Indexes** op velden zoals `nextExecutionAt`, `status` en `isActive` voor snellere queries.
* **Partitioning** van oude data zodat de tabellen klein en snel blijven.

### 2. API & Services

* **Load balancing (NGINX/Kubernetes)** om requests netjes te verdelen.
* **Horizontaal schalen** door meerdere API instances te draaien.
* **Stateless services** zodat opschalen eenvoudig blijft.
* **GraphQL optie**: in plaats van REST kan GraphQL handig zijn voor clients die alleen specifieke velden willen ophalen. Dit scheelt data-overdracht en maakt de API flexibeler, zeker bij complexe queries of grote datasets.

### 3. Queue & Jobs

* **BullMQ/Redis** voor job queues.
* **Prioriteiten en retries** zodat belangrijke taken altijd voorrang krijgen.
* **Concurrency control** om te voorkomen dat alles tegelijk wordt uitgevoerd.

### 4. Caching

* **Redis cache** voor jobstatus en veelgevraagde data.
* **CDN** voor statische bestanden.
* **Session caching** om de database te ontlasten.

### 5. Monitoring

* **Prometheus + Grafana** voor metrics en dashboards.
* **Logging in JSON** zodat we makkelijk kunnen filteren.
* **Alerts** bij fouten of hoge load.

---

## 🌍 Beschikbaarheid

* **Multi-region deployment** zodat gebruikers overal lage latency ervaren.
* **Backups en failover** voor de database.
* **Circuit breakers** voor externe services.
* **Graceful degradation**: liever minder features dan complete downtime.

---

## 🔒 Security

* **JWT-authenticatie** en input-validatie.
* **Rate limiting** per gebruiker of service tegen abuse.
* **SQL-injection preventie** via ORM.

---

## 📊 Targets

| Metric        | Target  | Aanpak                  |
| ------------- | ------- | ----------------------- |
| Response Time | < 100ms | Caching + DB optimalis. |
| Gebruikers    | 10.000  | Horizontaal schalen     |
| Jobs/minuut   | 1.000   | Queue management        |
| Query tijd    | < 25ms  | Indexes + replicas      |
| Uptime        | 99.9%   | Multi-region + failover |

---

## 💡 Kort gezegd

Met **horizontaal schalen**, **caching**, **job queues** en **multi-region deployment** zorgen we dat de scheduler microservice goed kan meegroeien met meer gebruikers en services. Daarnaast kan **GraphQL** een optie zijn om data efficiënter en flexibeler beschikbaar te maken, afhankelijk van de behoeften van de clients.
