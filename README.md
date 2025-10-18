# Streamoid Backend Take-Home

Backend service for CSV product upload and search.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=3000
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=streamoid
PGPORT=5432
```

3. Create database in PostgreSQL

4. Run:
```bash
npm start
```


## Start the Server

```bash
npm start
```
You should see:
```
Server running on port 3000
```

## Sample CSV

Create a file `products.csv`:
```csv
sku,name,brand,color,size,mrp,price,quantity
TSHIRT-RED-001,Classic Cotton T-Shirt,StreamThreads,Red,M,799,499,20
TSHIRT-BLK-002,Classic Cotton T-Shirt,StreamThreads,Black,L,799,549,12
POLO-GRN-003,Heritage Polo,StreamThreads,Green,XL,1299,999,8
JEANS-BLU-032,Slim Fit Jeans,DenimWorks,Blue,32,1999,1599,15
```

## Test the APIs (curl)

- POST `/upload` (multipart/form-data):
  ```powershell
  curl -X POST http://localhost:3000/upload -F "file=@products.csv"
  ```

- GET `/products` (with pagination):
  ```bash
  curl "http://localhost:3000/products?page=1&limit=10"
  ```

- GET `/products/search`:
  ```bash
  # by brand
  curl "http://localhost:3000/products/search?brand=StreamThreads"

  # by color
  curl "http://localhost:3000/products/search?color=Red"

  # by price range
  curl "http://localhost:3000/products/search?minPrice=500&maxPrice=1000"

  # combined
  curl "http://localhost:3000/products/search?brand=StreamThreads&minPrice=400&maxPrice=600"
  ```

## Test the APIs (Postman)

- POST `/upload`:
  - Method: POST
  - URL: `http://localhost:3000/upload`
  - Body: form-data
  - Key: `file` (type: File), Value: select `products.csv`

- GET `/products`:
  - Method: GET
  - URL: `http://localhost:3000/products?page=1&limit=10`

- GET `/products/search`:
  - Method: GET
  - URL examples:
    - `http://localhost:3000/products/search?brand=StreamThreads`
    - `http://localhost:3000/products/search?color=Red`
    - `http://localhost:3000/products/search?minPrice=500&maxPrice=1000`

## Validation Rules (CSV rows)

- **Required**: `sku`, `name`, `brand`, `mrp`, `price`
- **Price <= MRP**: Rows where `price > mrp` are rejected
- **Quantity >= 0**: Negative quantities are rejected
- On upload, response includes counts: `{ stored, failed }`

## Troubleshooting

- **Server won’t start**: Run `npm install`, then `npm start`.
- **DB init failed**: Ensure Postgres is running and DB `streamoid` exists; verify `.env` values.
- **Upload fails**: Make sure you send multipart/form-data with field name `file`.
