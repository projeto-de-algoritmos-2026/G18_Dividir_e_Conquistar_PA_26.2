# G18_Dividir_e_Conquistar_PA_26.2

---

### *Número da Lista*: 18  
### *Conteúdo da Disciplina*: Dividir e Conquistar
### *Vídeo de Apresentação do Projeto:* [link]
---

## Estudantes

| Matrícula | Aluno |
|---|---|
| 251023282 | Josef Wojtyla Barros de Souza |
| 251020226 | Eduardo de Sousa Brito |

---

## Sobre o Projeto

Este projeto apresenta uma visualização interativa do algoritmo clássico do **Par de Pontos Mais Próximos (*Closest Pair of Points*)** no plano 2D, resolvido com a estratégia de **Divisão e Conquista** em complexidade $O(n \log n)$.

### Como funciona?
1. **Entrada Interativa (`Canvas HTML5`)**: O usuário adiciona pontos clicando diretamente no quadro ou gerando distribuições aleatórias (entre `2` e `200` pontos).
2. **Processamento e Comparação (`Flask API`)**: Ao clicar em **Calcular**, o backend ([`app.py`](app.py)) valida os dados e executa:
   - **Divisão e Conquista ($O(n \log n)$)**: Ordena os pontos por $x$, divide recursivamente o conjunto ao meio por uma linha vertical $L$, resolve os subproblemas esquerdo ($\delta_1$) e direito ($\delta_2$), define $\delta = \min(\delta_1, \delta_2)$ e verifica apenas os pontos dentro da faixa central (*strip*) de largura $2\delta$ ordenados por $y$.
   - **Força Bruta ($O(n^2)$)**: Testa todos os pares possíveis para comprovar que ambos os algoritmos encontram exatamente a mesma distância mínima (`match`), comparando o número de comparações e o tempo real de execução (`time_ms`).
3. **Animação Passo a Passo (*Playback*)**: O frontend ([`static/app.js`](static/app.js)) consome a fila de eventos gerada pelo algoritmo e permite dar **Play/Pause**, avançar ou retroceder quadro a quadro (`◀`, `▶|`), controlar a velocidade e acompanhar a telemetria em tempo real (passo atual, comparações acumuladas, profundidade da recursão e valor de $\delta$).

---

## Vídeo de Apresentação

[Youtube](https://youtu.be/6hNaErCtkAE)

## Estrutura do Projeto

- [`algoritmo.py`](algoritmo.py): Implementação do algoritmo de Divisão e Conquista (`closest_pair`) com suporte a gravação de eventos e do algoritmo de Força Bruta (`brute_force`).
- [`app.py`](app.py): Servidor Flask com a rota principal (`GET /`) e o endpoint da API (`POST /api/solve`) com validação de entrada (`parse_points`).
- [`templates/index.html`](templates/index.html) e [`static/style.css`](static/style.css): Interface web responsiva, controles de playback, legenda de cores e painel de telemetria.
- [`static/app.js`](static/app.js): Renderização no `<canvas>`, comunicação assíncrona com a API e reprodutor de eventos da recursão.
- [`tests/test_algoritmo.py`](tests/test_algoritmo.py): Suíte de testes automatizados com `pytest`.

---

## Como Rodar Passo a Passo

### Pré-requisitos
- **Python 3.10+** instalado.

### 1. Clonar o repositório
```bash
git clone https://github.com/projeto-de-algoritmos-2026/G18_Dividir_e_Conquistar_PA_26.2.git
cd G18_Dividir_e_Conquistar_PA_26.2
```

### 2. Criar o ambiente virtual (`.venv`)
```bash
python -m venv .venv
```
*(No Linux/macOS, caso necessário, utilize `python3 -m venv .venv`)*

### 3. Ativar o ambiente virtual
- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\.venv\Scripts\activate.bat
  ```
- **Linux / macOS:**
  ```bash
  source .venv/bin/activate
  ```

### 4. Instalar as dependências
```bash
pip install -r requirements.txt
```

### 5. Iniciar a aplicação
```bash
python app.py
```
*(Ou, se preferir: `flask --app app run --debug`)*

Acesse no navegador: **http://127.0.0.1:5000**

---

## Como Executar os Testes Automatizados

Com o ambiente virtual ativado, execute na raiz do projeto:
```bash
pytest
```
