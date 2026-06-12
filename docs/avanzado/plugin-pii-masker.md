---
id: plugin-pii-masker
title: Plugin PII Masker
sidebar_position: 7
description: Como usar el plugin pii_masker para filtrar informacion confidencial (PII) antes de llamar a modelos en la nube.
---

# Plugin PII Masker

El plugin `pii_masker` protege la privacidad de los datos sensibles del usuario detectando y enmascarando Informacion de Identificacion Personal (PII) antes de enviar las consultas a modelos en la nube.

## Caracteristicas
- Deteccion mediante Expresiones Regulares para patrones estructurados:
  - DNI/NIE espanol
  - Pasaporte
  - IBAN de cuentas bancarias
  - Tarjetas de credito
  - Numero de Seguridad Social
  - Emails y Telefonos
  - Direcciones IP y coordenadas GPS
- Reconocimiento de Entidades Nombradas (NER) opcional con spaCy para nombres propios y ubicaciones.
- **Filtrado Exclusivo de Cloud**: El plugin intercepta el flujo en el hook `before_expert` y solo aplica el enmascaramiento si el experto destino es de tipo `api` (en la nube). Si el experto es local, los datos no se enmascaran, manteniendo el rendimiento y la integridad de la consulta local.

---

## Configuracion

Añade los parametros en tu `config/config.json`:

```json
{
  "pii_masker": {
    "enabled": true,
    "use_spacy": false,
    "spacy_model": "es_core_news_sm",
    "mask_names": false,
    "force_enabled": false
  }
}
```

### Parametros:
- `enabled`: Habilita o deshabilita el enmascaramiento.
- `use_spacy`: Activa el motor NER spaCy (requiere instalar `spacy`).
- `mask_names`: Enmascara nombres de personas y ubicaciones si `use_spacy` esta activo.
- `force_enabled`: Si es `true`, obliga a aplicar el enmascaramiento tambien para modelos locales (por defecto `false`).

---

## Dependencias Opcionales (para modo NER)

Si deseas enmascarar nombres de personas y ubicaciones usando spaCy:

```bash
pip install spacy
python -m spacy download es_core_news_sm
```
