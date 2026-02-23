from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import datetime
import os

app = FastAPI(title="产品管理系统 API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database (for demo purposes)
products_db = [
    {
        "id": 1,
        "name": "iPhone 15 Pro",
        "description": "苹果最新款智能手机，A17 Pro芯片，钛金属设计",
        "price": 8999.00,
        "stock": 50,
        "category": "电子产品",
        "status": "active",
        "created_at": "2024-01-15T10:00:00",
        "updated_at": "2024-01-15T10:00:00"
    },
    {
        "id": 2,
        "name": "MacBook Air M3",
        "description": "轻薄便携笔记本电脑，M3芯片，续航超长",
        "price": 9499.00,
        "stock": 25,
        "category": "电子产品",
        "status": "active",
        "created_at": "2024-01-14T10:00:00",
        "updated_at": "2024-01-14T10:00:00"
    },
    {
        "id": 3,
        "name": "纯棉T恤",
        "description": "100%纯棉材质，舒适透气，多色可选",
        "price": 129.00,
        "stock": 200,
        "category": "服装",
        "status": "active",
        "created_at": "2024-01-13T10:00:00",
        "updated_at": "2024-01-13T10:00:00"
    },
    {
        "id": 4,
        "name": "有机茶叶礼盒",
        "description": "精选高山有机茶叶，健康礼品首选",
        "price": 388.00,
        "stock": 0,
        "category": "食品",
        "status": "inactive",
        "created_at": "2024-01-12T10:00:00",
        "updated_at": "2024-01-12T10:00:00"
    },
    {
        "id": 5,
        "name": "智能台灯",
        "description": "可调节亮度，无蓝光危害，触控操作",
        "price": 299.00,
        "stock": 8,
        "category": "家居",
        "status": "active",
        "created_at": "2024-01-11T10:00:00",
        "updated_at": "2024-01-11T10:00:00"
    }
]

next_id = 6

class Product(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    stock: int
    category: str
    status: str = "active"

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    status: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "产品管理系统 API", "version": "1.0.0"}

@app.get("/api/products")
async def get_products():
    return products_db

@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    for product in products_db:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="产品不存在")

@app.post("/api/products")
async def create_product(product: Product):
    global next_id
    now = datetime.datetime.now().isoformat()
    new_product = {
        "id": next_id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category": product.category,
        "status": product.status,
        "created_at": now,
        "updated_at": now
    }
    products_db.append(new_product)
    next_id += 1
    return new_product

@app.put("/api/products/{product_id}")
async def update_product(product_id: int, product: ProductUpdate):
    for i, p in enumerate(products_db):
        if p["id"] == product_id:
            update_data = product.dict(exclude_unset=True)
            products_db[i].update(update_data)
            products_db[i]["updated_at"] = datetime.datetime.now().isoformat()
            return products_db[i]
    raise HTTPException(status_code=404, detail="产品不存在")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: int):
    global products_db
    for i, p in enumerate(products_db):
        if p["id"] == product_id:
            products_db.pop(i)
            return {"message": "产品删除成功"}
    raise HTTPException(status_code=404, detail="产品不存在")

if __name__ == "__main__":
    import uvicorn
    # Use port 9000 as required by the platform
    port = int(os.environ.get("PORT", 9000))
    uvicorn.run(app, host="0.0.0.0", port=port)
