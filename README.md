# Cubo Mágico em Camadas

Site interativo que ensina a montar o cubo mágico pelo **método de camadas**, com um cubo 3D feito em [p5.js](https://p5js.org/).

**[Abrir o site](https://igormoriera.github.io/magic-cube-layers/)** <!-- troque SEU-USUARIO pelo seu usuário do GitHub -->

## O que ele faz

- **Resolver:** você pinta as 6 faces com as cores do seu cubo, o site confere se o cubo é possível e mostra a solução giro a giro, com play, voltar, velocidade e a explicação de cada caso.
- **Aprender:** carrossel com os 7 passos do método (Cruz, 1ª camada, 2ª camada, Cruz de cima, Face de cima, Cantos e Minerva). Cada caso tem uma animação, e as peças que ainda não importam aparecem em cinza.
- **Dicas:** atalhos para montar mais rápido, com animação.
- **Cronômetro:** embaralhamento aleatório, tempo, melhor tempo e média de 5 (salvos só no navegador).
- **Legenda:** todos os códigos de movimento (R, R', U2, M', y, z2…), com destaque no que está sendo executado.

## Como funciona

| Arquivo | Papel |
|---|---|
| `index.html` | Estrutura das páginas |
| `css/style.css` | Visual (tema claro e escuro) |
| `js/engine.js` | Motor do cubo e solucionador, sem dependências |
| `js/app.js` | Interface e visualizador 3D em p5.js |
| `tests/engine.test.js` | Testes do motor e do solucionador |

O cubo é guardado como 54 adesivos. Cada movimento (faces, fatias do meio e giros do cubo inteiro) é uma permutação calculada a partir da geometria 3D das peças. O solucionador segue os passos do método de camadas, na mesma ordem em que uma pessoa aprende:

1. **Cruz:** uma busca curta (IDA*) encaixa um meio branco por vez, sem desfazer os anteriores.
2. **1ª e 2ª camadas:** regras de reconhecimento de caso + algoritmos do método (`R U R'`, `F' U' F`, `U R U R' U' F' U' F`…).
3. **Última camada:** reconhece ponto/L/linha, número de cantos amarelos, "faróis" e meios certos, posiciona o cubo e aplica o algoritmo do caso.

A validação confere contagem de cores, combinações de peças, orientação dos meios e cantos e paridade das trocas, para avisar quando a pintura tem erro.

## Rodar no seu computador

Não precisa instalar nada: abra o `index.html` no navegador. Para os testes (Node 18 ou mais novo):

```bash
node --test
```

Os testes conferem os movimentos, os algoritmos de cada passo, a validação e resolvem 2.000 cubos embaralhados ao acaso.

## Créditos

Método e sequência dos passos: canal **Montar Cubo Mágico** — playlists [Método de Camadas](https://www.youtube.com/playlist?list=PL47C27021F8B9383E) e [Dicas para montar mais rápido](https://www.youtube.com/playlist?list=PLvPafHk1XLU0t8DCAIqEvFtjLrDsTahTU). Algoritmos conferidos no material escrito do método em [cinoto.com.br](https://cinoto.com.br/cubomagico/principais/camadas/).

## Licença

[MIT](LICENSE)
