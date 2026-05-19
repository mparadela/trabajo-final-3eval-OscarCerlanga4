[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/eDdGzy79)
## **PROYECTO FINAL INTEGRADOR — DWEC 3ª EVALUACIÓN**

Se trata de programar una agenda web interactiva que carga automáticamente los festivos de España desde una API pública y permite gestionar tus propios eventos. Todo funciona en el navegador, sin servidor, usando JavaScript puro.

El proyecto se desarrolla exclusivamente en clase. No se valoran avances realizados fuera del horario lectivo. El repositorio GitHub Classroom debe tener commits regulares en cada sesión de trabajo, que servirán como registro de progreso.

La aplicación usa la API gratuita Nager.Date (https://date.nager.at/api/v3/PublicHolidays/2025/ES) que devuelve los festivos nacionales del año. Vosotros añadís, editáis y eliminéis vuestros propios eventos encima de esa base.

**Requisitos funcionales**
1. Carga de festivos (Fetch API): Al arrancar la aplicación se hace una petición GET a la API de festivos. Los festivos se muestran en la lista de eventos con una etiqueta visual que los distingue. Si la API falla, se muestra un mensaje de error claro al usuario.
2. Gestión de eventos propios (CRUD): El usuario puede crear eventos nuevos, ver todos los eventos en lista, y eliminar los que ha creado. Los festivos no se pueden eliminar.
3. Formulario con validación: El formulario de nuevo evento valida que el título no esté vacío, que la fecha tenga formato correcto y no sea anterior a hoy, y que la hora tenga formato HH:MM. Los errores se muestran junto al campo correspondiente, no en un alert.
4. Persistencia: Los eventos propios se guardan en localStorage y se recuperan al recargar la página.
5. Programación Orientada a Objetos Existe al menos una clase Evento con constructor, atributos y métodos propios.

**Tecnologías y condiciones**

Se usa Vanilla JavaScript (sin frameworks). El HTML y el CSS os los proporciono yo. Vosotros programáis únicamente el JavaScript. El código debe estar comentado en español y organizado en funciones y clases con nombres descriptivos. Se entrega a través de GitHub Classroom.

**Sobre el uso de inteligencia artificial**

Podéis usar herramientas de IA para consultar sintaxis o entender conceptos, igual que usáis JavaScript.info. No podéis usarla para generar el código de vuestra entrega. La defensa oral existe precisamente para que demostréis que entendéis lo que habéis programado. Un código que no podéis explicar es un código que no os pertenece, y eso se nota en la defensa.

**Ponderación de la evaluación**
| Componente | Peso|
|--------------|--------------|
| Proyecto   | 60%     |
| Defensa oral    | 40%    |

| Componente | Peso|
|--------------|--------------|
| Proyecto   | 60%     |
| Defensa oral    | 40%    |

**Criterios del proyecto (60%)**

| Criterio | Peso|
|--------------|--------------|
| Fetch y manejo de la API   | 20%     |
| CRUD funcional  | 25%    |
| Validación de formulario  | 20%    |
| localStorage  | 15%    |
| Uso de POO (clase Evento)  | 10%    |
| Uso de POO (clase Evento)  | 10%    |

**Defensa oral (10 minutos)**
Demostración en vivo de la aplicación funcionando y respuesta a 3-4 preguntas sobre decisiones que has tomado en el código. Puedes mirar el código durante la defensa.

