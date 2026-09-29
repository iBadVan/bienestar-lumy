"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Cabecera, Campo, Pantalla, inputCls } from "@/components/ui";
import { haySupabase, iniciarSesion, urlApi } from "@/lib/datos";
import { useStore } from "@/lib/store";

const GRADOS = [
  "1ro de secundaria",
  "2do de secundaria",
  "3ro de secundaria",
  "4to de secundaria",
  "5to de secundaria",
];

export default function Registro() {
  const { set } = useStore();
  const router = useRouter();
  const [f, setF] = useState({
    codigo: "",
    inicial: "",
    apellidos: "",
    edad: "",
    sexo: "",
    grado: "",
    padres: "",
    clave: "",
    clave2: "",
  });
  const [err, setErr] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cambia = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function enviar() {
    setErr("");
    const codigo = f.codigo.trim().toUpperCase();

    if (!/^LMY-[A-Z0-9]{5}$/.test(codigo)) {
      return setErr("Revisa tu código. Se ve así: LMY-K4T9P");
    }
    if (f.clave.length < 6) return setErr("Tu contraseña necesita al menos 6 caracteres.");
    if (f.clave !== f.clave2) return setErr("Las dos contraseñas no coinciden.");

    const edad = Number(f.edad);
    if (!edad || edad < 12 || edad > 17) return setErr("La edad debe estar entre 12 y 17 años.");
    if (!f.inicial.trim() || !f.apellidos.trim() || !f.sexo || !f.grado || !f.padres) {
      return setErr("Faltan datos por completar.");
    }
    if (!haySupabase) return setErr("No hay conexión con el servidor.");

    setEnviando(true);
    try {
      const r = await fetch(urlApi("/api/registro"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          clave: f.clave,
          inicial: f.inicial,
          apellidos: f.apellidos,
          edad,
          sexo: f.sexo,
          grado: f.grado,
          viveConAmbosPadres: f.padres,
        }),
      });
      const cuerpo = await r.json();
      if (!r.ok) {
        setEnviando(false);
        return setErr(cuerpo.error ?? "No se pudo completar tu registro.");
      }

      // Registrada. Se entra de una vez, sin pedirle escribir todo otra vez.
      const sesion = await iniciarSesion(codigo, f.clave);
      if (!sesion.ok) {
        setEnviando(false);
        return setErr("Tu cuenta se creó, pero no pudimos entrar. Intenta desde 'Soy estudiante'.");
      }

      set((e) => {
        e.perfil = {
          codigo,
          codigoEstudio: cuerpo.codigoEstudio,
          inicial: f.inicial.trim().toUpperCase(),
          apellidos: f.apellidos.trim(),
          edad,
          sexo: f.sexo,
          grado: f.grado,
          viveConAmbosPadres: f.padres,
        };
        e.claveCambiada = true;
        e.consentido = true;
        e.dia = 1;
        return e;
      });

      router.push("/app");
    } catch {
      setEnviando(false);
      setErr(
        "No pudimos conectar con el servidor. Revisa tu internet e intenta de nuevo. " +
          "Solo hace falta para este paso.",
      );
    }
  }

  return (
    <Pantalla>
      <Cabecera titulo="Crea tu cuenta" volver="/ingreso" />
      <h1 className="mb-1 font-display text-2xl font-bold">Crea tu cuenta</h1>
      <p className="mb-5 text-sm text-lumy-tintaSuave">
        Usa el código que te entregaron. Es único y sirve una sola vez.
      </p>

      <Campo label="Código de acceso" hint="Está en el papel que te dieron. Ejemplo: LMY-K4T9P">
        <input
          className={`${inputCls} font-display text-lg tracking-wider`}
          placeholder="LMY-XXXXX"
          value={f.codigo}
          onChange={(e) => cambia("codigo", e.target.value.toUpperCase())}
          autoCapitalize="characters"
          autoComplete="off"
        />
      </Campo>

      <h2 className="mb-2 mt-5 font-display text-base font-semibold">Tu contraseña</h2>
      <Campo label="Créala tú" hint="Mínimo 6 caracteres. Solo tú debes conocerla.">
        <input
          className={inputCls}
          type="password"
          value={f.clave}
          onChange={(e) => cambia("clave", e.target.value)}
        />
      </Campo>
      <Campo label="Repítela">
        <input
          className={inputCls}
          type="password"
          value={f.clave2}
          onChange={(e) => cambia("clave2", e.target.value)}
        />
      </Campo>

      <h2 className="mb-2 mt-5 font-display text-base font-semibold">Tus datos</h2>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Inicial del nombre">
          <input
            className={inputCls}
            placeholder="A"
            maxLength={1}
            value={f.inicial}
            onChange={(e) => cambia("inicial", e.target.value)}
          />
        </Campo>
        <Campo label="Apellidos">
          <input
            className={inputCls}
            placeholder="Pérez"
            value={f.apellidos}
            onChange={(e) => cambia("apellidos", e.target.value)}
          />
        </Campo>
        <Campo label="Edad">
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="15"
            value={f.edad}
            onChange={(e) => cambia("edad", e.target.value)}
          />
        </Campo>
        <Campo label="Sexo">
          <select className={inputCls} value={f.sexo} onChange={(e) => cambia("sexo", e.target.value)}>
            <option value="">Selecciona</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
        </Campo>
      </div>

      <Campo label="Grado escolar">
        <select className={inputCls} value={f.grado} onChange={(e) => cambia("grado", e.target.value)}>
          <option value="">Selecciona</option>
          {GRADOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="¿Vives con ambos padres?">
        <select className={inputCls} value={f.padres} onChange={(e) => cambia("padres", e.target.value)}>
          <option value="">Selecciona</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </Campo>

      {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
      <Boton onClick={() => void enviar()} disabled={enviando}>
        {enviando ? "Creando tu cuenta..." : "Registrarme"}
      </Boton>
      <p className="mt-3 text-center text-[0.7rem] text-lumy-tintaSuave">
        Necesitas internet solo para este paso.
      </p>
    </Pantalla>
  );
}
