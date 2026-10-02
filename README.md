# SaRU Client MVP

Frontend mobile-first do sistema de reservas do Restaurante Universitário da UPF.

## Executar localmente

~~~bash
npm install
npm run dev
~~~

A aplicação usa `http://localhost:5223` como API local. Para alterar o endereço, copie `.env.example` para `.env` e configure `VITE_SARU_API_URL`.

## Estrutura

- `src/app`: composição da aplicação e tipos de navegação.
- `src/features`: funcionalidades organizadas por domínio.
- `src/shared`: componentes de interface e layout reutilizáveis.
- `src/styles`: estilos globais, públicos e da área autenticada.
- `src/assets`: imagens e ícones estáticos.

## Validação

~~~bash
npm run lint
npm run build
~~~
