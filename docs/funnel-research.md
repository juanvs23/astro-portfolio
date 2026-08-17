# Funnel Research — Landing de conversión para el portfolio

> Referencia de modelo de negocio para el cambio SDD `home-funnel-landing`.
> Complementa `openspec/changes/home-funnel-landing/exploration.md` (que mapea el código actual).
> Fecha: 2026-08-06.

## 1. Qué es un funnel de captura

Un embudo de conversión es un sistema que transforma tráfico (`visitante`) en `lead`
(datos de contacto) y potencialmente en `cliente`. Para un freelancer dev, el objetivo
PRIMARIO de la home no es vender online, sino **captar leads calificados** y pasarlos a
un canal humano de venta (WhatsApp / email / llamada de descubrimiento). El funnel no
termina en la página: la página es el inicio de una secuencia de nurturing.

Principio rector: **una landing page tiene UN solo trabajo: convertir visitas en leads.**
Todo lo que distraiga de ese objetivo (múltiples CTAs, navegación pesada, texto largo arrira)
se elimina o minimiza.

## 2. Modelos de funnel aplicables

### AIDA (micro-funnel de la página en sí — el que mapea el scroll)
| Etapa | Objetivo | Elemento en la landing |
| --- | --- | --- |
| **Attention** | Capturar en <5s | Hook/hero arriba: H1 con propuesta de valor + subheadline. |
| **Interest** | Que siga scrolleando | Beneficios, pain points, cómo trabajo (problema → solución). |
| **Desire** | Bajar el riesgo percibido | Social proof: resultados, métricas, testimonios, clientes. |
| **Action** | Única acción clara | **UN solo CTA primario** + captura de lead (form o WhatsApp). |

### TOFU / MOFU / BOFU (funnel del negocio, no de la página)
- **TOFU (atención)**: la landing + contenido educativo atrae desconocidos. Métrica: tráfico, rebote.
- **MOFU (interés/consideración)**: el lead evalúa opciones. Se captura el dato (lead magnet, formulario, WhatsApp). Métrica: descargas, conversión a lead, duración.
- **BOFU (decisión)**: se ofrece la solución / asesoramiento directo. Métrica: solicitudes de contacto, demos agendadas, casos de éxito.

El mistake más común: brincarse MOFU y ofrecer directamente BOFU → leads no preparados.
Para el portfolio: la landing debe trabajar MOFU (generar confianza + captar) y empujar
BOFU (contacto) sin forzar el cierre.

## 3. Estadística de referencia (conversión)
- Mediana de conversión de landing cross-industria: **2.4% – 9.8%**; top páginas: **10% o más**.
- CTA primario en hero: captura 60-90% de los clicks.
- Mobile: CTA sticky + thumb-zone (botón 44-72px) puede subir signups ~50%.
- Encima del pliegue debe quedar claro el color del offer y el siguiente paso.

## 4. Estructura de landing de alta conversión (checklist por sección)
1. **Hero (above the fold)**: H1 benefit-focused, subheadline, UNA CTA primaria visible sin scroll, alto contraste, verbos de acción. No texto largo arriba.
2. **Pain/Promise**: nombrar el problema del visitante y la promesa de resultado.
3. **Cómo funciona / Proceso**: pasos (3 max) — reduce el riesgo percibido.
4. **Propuesta de valor + Servicios**: beneficios concretos (lapón del `/services` de los planes).
5. **Social proof**: métricas, casos, testimonios, logos. Se coloca cerca de los CTA.
6. **FAQ**: resuelve objeciones antes del CTA final.
7. **CTA final + captura de lead**: form corto (email + nombre, o WhatsApp) o asesoría.
8. **Nav mínima**: sin menu completo que escape a la pagina; UNA vectorización posible hacia servicios/contacto.

## 5. Destrucción de fricción (quién supone lead)
- **Form corto**: 2 campos max (email + nombre) o formulario de asesoría. Más campos = más abandono.
- **CTA único por sección**: elegir ONE primario; múltiples CTAs matan conversión.
- **Botón CTA**: copy que vende el siguiente paso ("Hablemos de tu proyecto" > "Enviar").
- **Riesgo-reversión**: "respuesta en 24h", "sin compromiso", "presupuesto sin cargo".
- **Mobile-first optimizado**: botones en zona del pulgar, CTA sticky en scroll largo.

## 6. Post-conversión (nurturing)
La captura NO es el fin. Al lead captarse, debe seguir una secuencia:
- Respuesta inmediata (autoresponder / WhatsApp).
- ICP: escalar si urgencia y capacidad.
- Emails/casos de éxito (MOFU→BOFU): demonstración de valor para los que aún deciden.
Esto se apoya en el flujo WhatsApp (`wa.me`) + `POST /api/contact` (Resend) ya presentes.

## 7. Decisión clave para la propuesta
1. **CTA primario**: → canal conversion de baja fricción. Opciones:
   - WhatsApp deep-link (`wa.me`, mensaje prearmado) — más warm en LATAM/VE.
   - Formulario `submitContactForm` → `/api/contact` (Resend) — captura email para crm.
   - Híbrido: form de captura + fallback WhatsApp.
2. **Lead magnet (MOFU)**: ¿entregar algo a cambio del email? (guía, checklist, auditoría gratis) — NO es obligatorio, define el equipo.
3. **Destino de SectionButtons / navegación**: eliminar vs compactar en nav fina.
4. **Analytics**: ninguno hoy — ¿agregar medición de conversión (eventos de CTA)? YAGNI hasta validar necesidad.

## 8. Errores a evitar
- Múltiples ofertas / CTAs (parálisis de decisión).
- Navegación completa que se (ruta de escape).
- Texto largo above the fold (CTAs done abajo del plieg).
- Sin social proof (netoramos sin evidencia).
- CTA genérico "Enviar/Submit".
- Ignorar el móvil (>=50% del tráfico B2B empieza móvil).

## 9. Métricas para medir (si se implementa analytics)
- CTR del CTA primario.
- Tasa de conversión form (visita→lead).
- Tasa de rebote / scroll depth (¿4 fases se superan?).
- Tiempo en página.
- Lead-to-customer ratio (calidad).

---
Fuentes sintetizadas: best-lead-generation-software, heyflow, thsmartfunnel, fetchfunnel,
saashero (CTA placement), myfunnelsecrets/tomba/prospeo (AIDA), funnel.io/cyberclick/hubspot
(TOFU/MOFU/BOFU).