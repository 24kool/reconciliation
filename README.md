1. How to run:

a. Backend:

```
cd backend
conda create -n collective-kc python=3.11
conda activate collective-kc
pip install -r requirements.txt
uvicorn main:app --reload
```

b. Frontend:

```
cd ..
cd frontend
npm install
npm run dev
```

