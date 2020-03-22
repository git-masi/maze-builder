console.clear();

const form = document.getElementById('mazeForm');

form.addEventListener('submit', buildMaze);

// use to create maze immediately
document.querySelector('input[type="submit"]').click();

function buildMaze(e) {
  e.preventDefault();
  document.querySelector('.maze-container').classList.remove('hide');
  document.querySelector('input[type="submit"]').disabled = true;

  // convert to number
  const cols = document.querySelector('input[name="numCols"]').value * 1;
  const rows = document.querySelector('input[name="numRows"]').value * 1;

  const width = window.innerWidth * .9;
  const height = window.innerHeight * .9;
  const square = Math.floor(Math.min(width, height));

  document.documentElement.style.setProperty('--width', square + 'px');
  document.documentElement.style.setProperty('--height', square + 'px');
  document.documentElement.style.setProperty('--cols', cols);
  document.documentElement.style.setProperty('--rows', rows);

  const mazeElement = document.querySelector('.maze');
  const mazeObj = createMazeAdjacencyList(rows, cols)
  const mazeAdjacencyList = mazeObj.list;
  const mazeStart = mazeObj.start;
  const longestPathObj = findLongestPath(mazeStart, mazeAdjacencyList);
  const mazeEnd = longestPathObj.end;
  const mazeSpaces = Object.keys(mazeAdjacencyList);

  for (let i = 0; i < mazeSpaces.length; i++) {
    const div = document.createElement('DIV');
    div.classList.add('maze-space');
    div.classList.add(i);
    mazeElement.appendChild(div);
  }

  const mazeSpaceElements = document.querySelectorAll('.maze-space');



  // longestPathObj.longestPath.forEach(el => mazeSpaceElements[el].classList.add('maze-space--visited'));



  addBordersToMaze(mazeSpaceElements, mazeAdjacencyList, mazeSpaces, cols, rows * cols);

  const mazeStartElement = mazeSpaceElements[mazeStart];
  const mazeEndElement = mazeSpaceElements[mazeEnd];

  mazeStartElement.classList.add('maze-current');
  mazeEndElement.classList.add('maze-end');

  // mazeStartElement.addEventListener('mouseover', () => mouseOverMazeStart(mazeSpaceElements, mazeStartElement, mazeEndElement));

  let currentSpace = mazeStart;

  window.addEventListener('keypress', (e) => moveCharacter(e, currentSpace, cols, mazeAdjacencyList, mazeSpaceElements));

  mazeStartElement.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
}


// create a valid maze, unweighted undirected graph stored as adjacency list
function createMazeAdjacencyList(rows = 3, cols = 3) {
  const totalGridSpaces = rows * cols;
  const start = Math.floor(Math.random() * totalGridSpaces);
  const visited = [start];
  const list = {};
  let current = start;

  // initialize the adjacency list
  for (let i = 0; i < totalGridSpaces; i++) {
    list[i] = [];
  }

  while (visited.length < totalGridSpaces) {
    let adjacentSpaces = getAdjacentSpaces(current, cols, totalGridSpaces);
    let visitNewSpace = false;

    while (adjacentSpaces.length > 0) {
      let next = adjacentSpaces[Math.floor(Math.random() * adjacentSpaces.length)];

      if (!visited.includes(next)) {
        visited.push(next);
        list[next].push(current);
        list[current].push(next);
        current = next;
        visitNewSpace = true;
        break;
      } else {
        adjacentSpaces = adjacentSpaces.filter(el => el !== next);
      }
    }

    // backtracking
    if (!visitNewSpace) {
      const idx = visited.indexOf(current);
      if (idx - 1 < 0) break;
      current = visited[idx - 1];
    }
  }

  return {list, start};
}


function getAdjacentSpaces(currentSpace, numCols, totalGridSpaces) {
  let adjacentSpaces = [];

  if (currentSpace - numCols >= 0) adjacentSpaces.push(currentSpace - numCols);
  if (currentSpace % numCols !== 0) adjacentSpaces.push(currentSpace - 1);
  if (currentSpace + 1 < totalGridSpaces && (currentSpace + 1) % numCols !== 0) adjacentSpaces.push(currentSpace + 1);
  if (currentSpace + numCols < totalGridSpaces) adjacentSpaces.push(currentSpace + numCols);

  return adjacentSpaces;
}


async function addBordersToMaze(mazeSpaceElements, adjacencyList, mazeSpaces, numCols, totalGridSpaces) {
  for (let space of mazeSpaces) {
    // convert space from string to number;
    space = space * 1;
    const border = {
      top: space - numCols,
      left: space - 1,
      right: space + 1,
      bottom: space + numCols
    }

    // console.log(border);
    // console.log(adjacencyList[space]);
    // console.log(space);
    // console.log(space + 1);
    // console.log(((space + 1) % numCols) === 0);
    // console.log(numCols);

    if (adjacencyList[space].includes(border.top)) border.top = null;
    if (adjacencyList[space].includes(border.left)) border.left = null;
    if (adjacencyList[space].includes(border.right)) border.right = null;
    if (adjacencyList[space].includes(border.bottom)) border.bottom = null;

    if (border.top !== null) mazeSpaceElements[space].classList.add('top-border');
    if (border.left !== null) mazeSpaceElements[space].classList.add('left-border');
    if (border.right !== null) mazeSpaceElements[space].classList.add('right-border');
    if (border.bottom !== null) mazeSpaceElements[space].classList.add('bottom-border');
  }
}

function mouseOverMazeStart(mazeSpaceElements, mazeStart, mazeEnd) {
  mazeSpaceElements.forEach(el => {
    if (el !== mazeStart && el !== mazeEnd) el.addEventListener('mouseover', mouseOverMazeSpace);
  });
}

function mouseOverMazeSpace(e) {
  if (e.target.classList.contains('maze-space--visited')) {
    e.target.classList.remove('maze-space--visited');
  } else {
    e.target.classList.add('maze-space--visited');
  }
}

function findLongestPath(start, maze) {
  let currentPointInMaze = start;
  let longestPath = [start];
  const path = [start];
  const visited = [start];
  let addedToPath = false;

  while (visited.length < Object.keys(maze).length) {
    addedToPath = false;

    for (let adjacentPoint of maze[currentPointInMaze]) {
      if (visited.includes(adjacentPoint)) {
        continue;
      } else {
        path.push(adjacentPoint);
        visited.push(adjacentPoint);
        addedToPath = true;
        break;
      }
    }

    if (path.length > longestPath.length) longestPath = [...path];

    if (!addedToPath) path.pop();

    currentPointInMaze = path[path.length - 1];
  }

  const end = longestPath[longestPath.length - 1];

  return { longestPath, start, end };
}

function moveCharacter(e, currentSpace, numCols, mazeAdjacencyList, mazeSpaceElements) {
  const adjacentSpaces = getAdjacentSpaces(currentSpace, mazeAdjacencyList[currentSpace]);
  const currentElement = mazeSpaceElements[currentSpace];

  console.log(currentSpace, adjacentSpaces);

  if (e.key === 'w') {
    console.log('w');
    console.log(currentElement);
    if (!currentElement.classList.contains('top-border')) currentSpace -= numCols;
  }

  if (e.key === 's') {
    console.log('s');
    if (!currentElement.classList.contains('bottom-border')) currentSpace += numCols;
  }

  if (e.key === 'a') {
    console.log('a');
    if (!currentElement.classList.contains('left-border')) currentSpace -= 1;
  }

  if (e.key === 'd') {
    console.log('d');
    if (!currentElement.classList.contains('right-border')) currentSpace += 1;
  }

  console.log(currentSpace);
}
