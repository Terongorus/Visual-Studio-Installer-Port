---
description: Actualizaciones de disponibilidad general del Kit de herramientas de Teams 17.14.
area: IDE
title: Kit de herramientas de agentes de Microsoft 365
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: Teamstoolkit

---


Nos complace anunciar que nuestro producto, anteriormente conocido como Kit de herramientas de Teams, pasa a llamarse Kit de herramientas para agentes de Microsoft 365. Este cambio refleja nuestro enfoque ampliado y compromiso para admitir una gama más amplia de plataformas y tipos de proyecto dentro del ecosistema de Microsoft 365.

A medida que continuamos mejorando nuestro producto, estamos cambiando nuestro enfoque de apoyar únicamente el desarrollo de Teams a capacitar a los desarrolladores para crear agentes de Microsoft 365 Copilot y otras aplicaciones en toda la plataforma Microsoft 365. Estas plataformas incluyen Microsoft 365 Copilot, Microsoft Teams, familia de Office y Outlook. Esta ampliación del ámbito nos permite prestar un mejor servicio a nuestros usuarios proporcionándoles herramientas, plantillas y recursos completos para desarrollar una amplia variedad de soluciones de Microsoft 365.

El nuevo nombre, Kit de herramientas para agentes de Microsoft 365, representa mejor las diversas funcionalidades y funcionalidades de nuestro producto. Creemos que este cambio ayudará a nuestros usuarios a identificar con mayor facilidad la gama completa de oportunidades de desarrollo disponibles en el entorno de Microsoft 365.

Gracias por su continuo apoyo a medida que evolucionamos para satisfacer las crecientes necesidades de nuestra comunidad de desarrolladores.


### Crear un agente declarativo 

Nos complace anunciar que en esta versión se han agregado plantillas de proyecto para crear agentes declarativos para Microsoft 365 Copilot.

![creación de un proyecto de DA](../media/atk_da_create.png)

Puede crear un agente declarativo con o sin una acción. Se puede elegir entre definir nuevas APIs o usar las existentes para realizar tareas o recuperar datos.

Use el Kit de herramientas para agentes de Microsoft 365 para depurar y obtener una vista previa de los agentes declarativos en Microsoft Copilot.

### Habilitar depuración rápida con un solo clic
En versiones anteriores del Kit de herramientas de Teams, que ahora se denomina Kit de herramientas para agentes de Microsoft 365, cuando los usuarios depuraban cualquier solución generada, era necesario usar el comando **Preparar la dependencia de la aplicación de Teams** antes de depurar el proyecto. Este comando activaba el kit de herramientas para que los desarrolladores pudieran crear recursos esenciales para la depuración, como registrar o actualizar la aplicación de Teams.

Para mejorar la forma de usar la depuración y hacer que sea más intuitiva para los usuarios de Visual Studio, hemos quitado este paso y hemos habilitado una función de depuración con un solo clic. Ahora, puede hacer clic directamente en el botón depurar sin realizar los pasos de preparación. Sin embargo, si ha realizado modificaciones en el manifiesto de la aplicación entre dos eventos de depuración y necesita actualizar la aplicación, sigue habiendo una opción para hacerlo.
Ofrecemos dos perfiles de depuración:

![perfiles de depuración](../media/atk_debug_profiles.png)

- **Depurar con la aplicación actualizada**: seleccione el perfil por defecto `[Your Target Launch Platform] (browser)` si ha realizado modificaciones en la aplicación, para asegurarse de que se aplican las actualizaciones.
- **Depurar sin actualizar la aplicación**: seleccione el segundo perfil `[Your Target Launch Platform] (browser) (skip update app) ` para omitir la actualización de recursos de la aplicación, lo que hace que la depuración sea más sencilla y rápida.

### Actualice a .NET 9.

Asimismo, en esta versión, hemos actualizado todas las plantillas de proyecto para poder soportar .NET 9.

![compatibilidad con .net9](../media/atk_net9.png)

**Disfrute programando.**  
*El equipo del Kit de herramientas para agentes de Microsoft 365*
