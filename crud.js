const d = document,
  $template = d.getElementById("crud-template").content,
  $fragment = d.createDocumentFragment(),
  $contentPost = d.querySelector(".content-post"),
  $form = d.querySelector(".crud-form"),
  $title = d.querySelector(".title"),
  $customAlert = d.getElementById("custom-alert"),
  apiURL = "https://jsonplaceholder.typicode.com/posts/";

//Scroll form para editar un post
let scrollToEdit = () => {
  window.scrollTo({
    top: 0,
    left: 0,
  });
};

//Resetar el formulario
let resetForm = () => {
  $form.id.removeAttribute("value");
  $title.textContent = "Crear Post";
  $form.querySelector('button[type="submit"]').textContent = "CREAR POST";
  $form.body.textContent = "";
  $form.title.textContent = "";
  $form.reset();
};

// Crear alterta personalizada
let customAlert = (mensaje, color) => {
  $customAlert.classList.add(color, "opacity-100");
  $customAlert.textContent = mensaje;

  setTimeout(() => {
    $customAlert.textContent = "";
    $customAlert.classList.add("opacity-0");
    $customAlert.classList.remove(color, "opacity-100");
  }, 1500);
};


// Colocar el loader
$contentPost.innerHTML = `<img class="mx-auto" src="assets/loader.svg" alt="cargando...">`;


/*******************       Obtener Todos los Post         ******************** */


const getAll = async () => {
  try {
    let res = await fetch(`${apiURL}`),
      json = await res.json();

    json.sort(function (a, b) {
      return b.id - a.id;
    });

    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    // Obtenemos todos los valores y agregamos los valores correspondientes para cada post

    json.forEach((el) => {
      $template.querySelector(".title-post p").textContent = el.title;
      $template.querySelector(".body-post p").textContent = el.body;
      $template.querySelector(".edit").dataset.id = el.id;
      $template.querySelector(".edit").dataset.title = el.title;
      $template.querySelector(".edit").dataset.body = el.body;
      $template.querySelector(".delete").dataset.id = el.id;
      $template.querySelector("article").dataset.id = el.id;

      let $clone = d.importNode($template, true);
      $fragment.appendChild($clone);
    });
    $contentPost.innerHTML = "";
    $contentPost.appendChild($fragment);
  } catch (err) {
    let message = err.statusText || "Ocurrió un error";
    $contentPost.insertAdjacentHTML(
      "afterend",
      `<p class="text-red-600"><b>${err.status} : ${message}</b></p>`
    );

    console.log(err);
  }
};
// Finalmente se colocan en el DOM todos los post
d.addEventListener("DOMContentLoaded", getAll);




/*******************       Crear y Editar un Post         ******************** */

// Seteamos el valor a 100 segun el numero
let newId = 100;

d.addEventListener("submit", async (e) => {
  if (e.target === $form) {
    e.preventDefault();

    //Si el input hidden del form no tiene valor creara un post, sino editara una post
    if (!e.target.id.value) {
      //Create - post - Crear la entrada
      try {
        let options = {
            method: "POST",
            headers: {
              "Content-type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({
              title: e.target.title.value,
              body: e.target.body.value,
            }),
          },
          res = await fetch(apiURL, options);
        json = await res.json();

        newId++;
        // Colocamos esta funcionalidad debido a que es un fake api y colocamos solo en el DOM

        $template.querySelector(".title-post p").textContent = json.title;
        $template.querySelector(".body-post p").textContent = json.body;
        $template.querySelector(".edit").dataset.id = newId;
        $template.querySelector(".edit").dataset.title = json.title;
        $template.querySelector(".edit").dataset.body = json.body;
        $template.querySelector(".delete").dataset.id = newId;
        $template.querySelector("article").dataset.id = newId;

        let $clone = d.importNode($template, true);
        $fragment.appendChild($clone);

        // Insertamos los datos
        $contentPost.insertAdjacentElement("afterbegin", $fragment.children[0]);

        // Creamos la alterta y limpiamos el formulario
        customAlert("¡Post creado con éxito!", "text-green-600");
        resetForm();

        if (!res.ok) throw { status: res.status, statusText: res.statusText };
      } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $form.insertAdjacentHTML(
          "afterend",
          `<p><b>${err.status} : ${message}</b></p>`
        );
      }
    } else {
      //PUT - editar
      try {
        if (e.target.id.value <= 100) {
          let options = {
              method: "PUT",
              headers: {
                "Content-type": "application/json; charset=utf-8",
              },
              body: JSON.stringify({
                title: e.target.title.value,
                body: e.target.body.value,
                userId: e.target.id.value,
              }),
            },
            res = await fetch(`${apiURL + e.target.id.value}`, options),
            json = await res.json();

          //Si tenemos un error lo enviamos al catch
          if (!res.ok) throw { status: res.status, statusText: res.statusText };
        }

        let newEdit = [...d.querySelector(".content-post").children];
        newEdit.map((item) => {
          if (item.dataset.id === e.target.id.value) {
            item.querySelector(".title-post p").textContent =
              e.target.title.value;
            item.querySelector(".body-post p").textContent =
              e.target.body.value;
            item.querySelector(".edit").dataset.title = e.target.title.value;
            item.querySelector(".edit").dataset.body = e.target.body.value;
          }
        });

        customAlert("¡Post editado con éxito!", "text-yellow-600");
        resetForm();
      } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $form.insertAdjacentHTML(
          "afterend",
          `<p><b>${err.status} : ${message}</b></p>`
        );

        console.log(err);
      }
    }
  }
});

// Aca controlamos los botones de editar y de eliminar

d.addEventListener("click", async (e) => {

  if (e.target.matches(".edit")) {

    scrollToEdit();
    $title.textContent = "Editar Post";
    $form.querySelector('button[type="submit"]').textContent = "EDITAR POST";

    //aqui se asigan los valores a cada input correspondiente
    $form.title.value = e.target.dataset.title;
    $form.body.textContent = e.target.dataset.body;

    //Este es el elemento input hidden que permite evaluar ahora si se va a editar el elemento
    $form.id.value = e.target.dataset.id;
    
  }

  if (e.target.matches(".delete")) {

    let isDelete = confirm(
      `¿Estás seguro que deseas elmininar el id ${e.target.dataset.id}?`
    );

    if (isDelete) {

      try {
        let options = {
            method: "DELETE",
            headers: {
              "Content-type": "application/json; charset=utf-8",
            },
          },
          res = await fetch(`${apiURL + e.target.dataset.id}`, options);
        json = await res.json();

        if (!res.ok) throw { status: res.status, statusText: res.statusText };

        // Remover el post del DOM
        let toDelete = [...d.querySelector(".content-post").children];
        toDelete.map(
          (item) => item.dataset.id === e.target.dataset.id && item.remove()
        );

        customAlert("¡Post eliminado con éxito!", "text-red-600");
        resetForm();

      } catch (err) {
        let message = err.statusText || "Ocurrió un error";
        $form.insertAdjacentHTML(
          "afterend",
          `<p><b>${err.status} : ${message}</b></p>`
        );
      }
    }
  }
});
