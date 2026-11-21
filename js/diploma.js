document.addEventListener("DOMContentLoaded", async function () {
  const target = document.getElementById("diplomas-body");
  if (!target) return;

  try {
    const [session, profile, enrollments] = await Promise.all([
      apiRequest("/auth/me"),
      apiRequest("/profile"),
      apiRequest("/student/enrollments")
    ]);

    if (session.data.user.role !== "estudiante") {
      throw new Error("Solo los estudiantes pueden consultar certificados.");
    }

    target.replaceChildren();
    const completed = enrollments.data.filter(function (row) {
      return row.completed_at && Number(row.progress_percent) >= 100;
    });

    if (!completed.length) {
      target.textContent = "Aún no has terminado cursos.";
      return;
    }

    completed.forEach(function (row) {
      const certificate = document.createElement("article");
      certificate.className = "diploma";

      const topLine = document.createElement("p");
      topLine.className = "diploma-marca";
      topLine.textContent = "EDUCURSOS · ACADEMIA DIGITAL";

      const heading = document.createElement("h2");
      heading.className = "diploma-titulo";
      heading.textContent = "Certificado de finalización";

      const intro = document.createElement("p");
      intro.className = "diploma-intro";
      intro.textContent = "Se otorga el presente reconocimiento a";

      const name = document.createElement("h3");
      name.className = "diploma-nombre";
      name.textContent = profile.data.full_name;

      const description = document.createElement("p");
      description.className = "diploma-descripcion";
      description.append("por haber completado satisfactoriamente el curso");

      const course = document.createElement("p");
      course.className = "diploma-curso";
      course.textContent = "«" + row.course_title + "»";

      const details = document.createElement("div");
      details.className = "diploma-detalles";
      details.append(
        makeCertificateDetail("Impartido por", row.instructor_name),
        makeCertificateDetail("Fecha de finalización", formatCertificateDate(row.completed_at))
      );

      const seal = document.createElement("div");
      seal.className = "diploma-sello";
      seal.setAttribute("aria-label", "Certificado EduCursos");
      seal.textContent = "EC";

      const footer = document.createElement("p");
      footer.className = "diploma-pie";
      footer.textContent = "Aprender hoy · avanzar siempre";

      const printButton = document.createElement("button");
      printButton.type = "button";
      printButton.className = "btn diploma-print-button";
      printButton.textContent = "Imprimir / Guardar este diploma";
      printButton.addEventListener("click", function () {
        const previousTitle = document.title;
        certificate.classList.add("diploma-seleccionado");
        document.title = "Diploma - " + row.course_title;
        try { window.print(); }
        finally {
          certificate.classList.remove("diploma-seleccionado");
          document.title = previousTitle;
        }
      });
      certificate.append(topLine, heading, intro, name, description, course, details, seal, footer, printButton);
      target.appendChild(certificate);
    });


  } catch (error) {
    target.textContent = error.message;
  }
});

function makeCertificateDetail(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "diploma-dato";
  const heading = document.createElement("span");
  heading.textContent = label;
  const content = document.createElement("strong");
  content.textContent = value || "No disponible";
  wrapper.append(heading, content);
  return wrapper;
}

function formatCertificateDate(value) {
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(date);
}



