# Urna Eletrônica Escolar

Protótipo de interface para demonstração de uma votação escolar.

## Como testar

Abra `Urna_Escolar.html` em um navegador moderno. Para identificação, o estudante digita qualquer código não vazio e deve usar o mesmo código caso vote novamente neste navegador. As chapas disponíveis são:

- `10` — Inovação
- `20` — Futuro
- `30` — Transformação

O fluxo permite revisar a escolha, alterá-la ou cancelar antes da confirmação. Após a confirmação, o código usado e a contagem são mantidos no armazenamento local do navegador (`localStorage`).

Nesta configuração de teste, a votação encerra em **6 de novembro de 2026 às 9h25 (UTC−03:00)**. Ao chegar o prazo, a tela bloqueia novos votos e mostra a chapa mais votada ou um empate. O horário usa o relógio do dispositivo que abriu a página; mantenha a página aberta para ver o encerramento automaticamente.

## Limitações importantes

Este projeto é somente demonstrativo. Como qualquer código digitado é aceito, o sistema não comprova a identidade do estudante; uma mesma pessoa pode tentar votar novamente usando outro código. Os códigos e os votos ficam no navegador, podem ser vistos ou alterados por quem usa o dispositivo, não são sincronizados entre computadores e não constituem um registro eleitoral seguro. Não use para uma eleição real. Uma eleição oficial exige, entre outros requisitos, identificação validada, armazenamento e validação em um servidor confiável, controles de acesso, proteção da privacidade e procedimentos de auditoria.

`UrnaEscolar.java` é um exemplo de console separado que imprime os dados das chapas; ele não está conectado à interface web nem ao armazenamento de votos.
