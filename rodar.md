# Guia para rodar

## 1. Criar o ambiente virtual
```bash
python -m venv .venv
```
ou 
```bash
python3 -m venv .venv
```
## 2. Ativar o ambiente virtual
> windows
```bash
.\.venv\Scripts\Activate.ps1
```

> linux
```bash
source .venv/bin/activate
```

## 3. instalar as dependecias (requirements)
```bash
pip install -r requirements.txt
```

## 4. rodar o servidor flask
```bash
flask --app app run --debug
```

>> acesse: http://127.0.0.1:5000