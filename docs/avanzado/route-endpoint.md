---
id: route-endpoint
title: Endpoint de Diagnóstico /v1/route
sidebar_position: 8
description: Cómo usar el endpoint /v1/route para depurar y ajustar la configuración del router de l3mcore sin generar ninguna respuesta del modelo.
---

# Endpoint de Diagnóstico `/v1/route`

El endpoint `/v1/route` permite interrogar al router de l3mcore directamente: le pasas un texto y te devuelve qué experto habría elegido, con qué confianza, y cómo quedarían clasificados el resto de expertos. Todo eso sin invocar ningún modelo ni generar ninguna respuesta.

Es la herramienta que faltaba para configurar y depurar un sistema de expertos con rigor.

---

## Por qué existe

Cuando configuras un nuevo experto en `experts.json`, la única forma de saber si el router lo detecta bien es mandar un mensaje real y esperar la respuesta. Eso mezcla dos problemas en uno: ¿falló el router o falló el modelo?

Con `/v1/route` puedes iterar sobre las keywords y la descripción de tus expertos de forma independiente, en segundos, sin cargar ningún modelo.

---

## Uso

### GET (más rápido para pruebas)

```bash
curl "http://localhost:11435/v1/route?text=escribe+un+script+en+python"
```

### POST (recomendado para textos largos o con caracteres especiales)

```bash
curl -X POST http://localhost:11435/v1/route \
  -H "Content-Type: application/json" \
  -d '{"text": "necesito refactorizar esta función, está dando un error de índice"}'
```

### Respuesta

```json
{
  "expert":       "programador",
  "score":        0.8734,
  "method":       "embedding",
  "cascade_step": 1,
  "top_experts": [
    { "expert": "programador", "score": 0.8734 },
    { "expert": "sysadmin",    "score": 0.0891 },
    { "expert": "redactor",    "score": 0.0241 },
    { "expert": "traductor",   "score": 0.0089 },
    { "expert": "fallback",    "score": 0.0045 }
  ]
}
```

---

## Campos de la respuesta

| Campo | Tipo | Descripción |
|---|---|---|
| `expert` | string | Experto que habría gestionado la solicitud. |
| `score` | float | Confianza del router, entre 0 y 1. |
| `method` | string | Método de enrutamiento usado: `embedding`, `classification`, o `fallback`. |
| `cascade_step` | int \| null | Paso del enrutamiento en cascada donde se resolvió (1 o 2). `null` si no hubo match. |
| `top_experts` | array | Top 5 expertos ordenados por puntuación (solo disponible en modo `embedding`). |

---

## Casos de uso habituales

### Verificar una keyword nueva

Acabas de añadir el experto `contabilidad` con sus keywords. Antes de reiniciar el servidor en producción, comprueba cómo lo clasifica el router:

```bash
curl "http://localhost:11435/v1/route?text=balance+de+situacion+cierre+fiscal"
```

Si el experto `contabilidad` no aparece primero en `top_experts`, las keywords necesitan más especificidad.

### Detectar solapamiento entre expertos

Si dos expertos compiten por el mismo vocabulario, el router tenderá a la ambigüedad. Con `/v1/route` puedes identificar exactamente qué palabras confunden al sistema:

```bash
curl "http://localhost:11435/v1/route?text=configurar+servidor+nginx"
```

Si tanto `sysadmin` como `programador` tienen scores altos y cercanos, ajusta las keywords para diferenciarlos mejor.

### Construir un panel de pruebas

El endpoint es ideal para construir scripts de test automatizados que verifiquen el comportamiento del router tras cada cambio en `experts.json`:

```bash
#!/bin/bash
assert_expert() {
  local text="$1"
  local expected="$2"
  local result=$(curl -s "http://localhost:11435/v1/route?text=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$text'))")" | python3 -c "import sys,json; print(json.load(sys.stdin)['expert'])")
  if [ "$result" = "$expected" ]; then
    echo "✅ '$text' → $result"
  else
    echo "❌ '$text' → $result (expected: $expected)"
  fi
}

assert_expert "escribe una función en python" "programador"
assert_expert "traduce este texto al inglés" "traductor"
assert_expert "configura el firewall de ubuntu" "sysadmin"
```

---

## Límites y seguridad

- El texto de entrada se limita a **2000 caracteres**. Los textos más largos se truncan silenciosamente.
- Los caracteres de control (`\x00`–`\x1f`, `\x7f`) se eliminan antes de procesar.
- El endpoint está sujeto al mismo rate limiter que el resto de la API (100 peticiones/minuto por IP por defecto).
- El endpoint **no invoca ningún modelo experto** y **no genera ninguna respuesta de texto**. Solo ejecuta el router.
- En modo `classification` (BERT/RoBERTa), el campo `top_experts` devuelve una lista vacía porque ese modo no expone scores intermedios por diseño.

---

## Integración con herramientas externas

El endpoint responde JSON estándar y es compatible con cualquier cliente HTTP. Algunos ejemplos:

**Python:**
```python
import httpx

r = httpx.get("http://localhost:11435/v1/route", params={"text": "necesito ayuda con sql"})
data = r.json()
print(f"Expert: {data['expert']} ({data['score']:.0%})")
```

**JavaScript:**
```js
const res = await fetch("http://localhost:11435/v1/route?text=ayudame+con+sql");
const data = await res.json();
console.log(`Expert: ${data.expert} (${(data.score * 100).toFixed(0)}%)`);
```
