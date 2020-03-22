console.clear();

class Maze {
  constructor(playerElement, rows, cols, mazeElement) {
    this.player = playerElement;
    this.rows = rows;
    this.cols = cols;
    this.mazeElement = mazeElement;
    this.currentPosition = null;
    this.start = null;
    this.end = null;
    this.longestPath = null;

    this.buildMaze(this.cols, this.rows, mazeElement);
  }

  buildMaze(cols, rows, mazeElement) {
    const mazeObj = this.createMazeAdjacencyList(rows, cols);
    const mazeAdjacencyList = mazeObj.list;
    this.start = mazeObj.start;
    this.currentPosition = this.start;
    const mazeStart = this.start;
    const longestPathObj = this.findLongestPath(mazeStart, mazeAdjacencyList);
    this.end = longestPathObj.end;
    this.longestPath = longestPathObj.longestPath;
    const mazeEnd = this.end;
    const mazeSpaces = Object.keys(mazeAdjacencyList);

    for (let i = 0; i < mazeSpaces.length; i++) {
      const div = document.createElement('DIV');
      div.classList.add('maze-space');
      div.classList.add(i);
      mazeElement.appendChild(div);
    }

    const mazeSpaceElements = mazeElement.querySelectorAll('.maze-space');

    this.addBordersToMaze(mazeSpaceElements, mazeAdjacencyList, mazeSpaces, cols, rows * cols);

    const mazeStartElement = mazeSpaceElements[mazeStart];
    const mazeEndElement = mazeSpaceElements[mazeEnd];

    mazeStartElement.classList.add('maze-current');
    mazeEndElement.classList.add('maze-end');

    this.updatePosition();

    window.addEventListener('keypress', (e) => debounce(this.moveCharacter(e, mazeSpaceElements), 20));

    mazeStartElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }


  // create a valid maze, unweighted undirected graph stored as adjacency list
  createMazeAdjacencyList(rows = 3, cols = 3) {
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
      let adjacentSpaces = this.getAdjacentSpaces(current, cols, totalGridSpaces);
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

    return { list, start };
  }


  getAdjacentSpaces(currentSpace, numCols, totalGridSpaces) {
    let adjacentSpaces = [];

    if (currentSpace - numCols >= 0) adjacentSpaces.push(currentSpace - numCols);
    if (currentSpace % numCols !== 0) adjacentSpaces.push(currentSpace - 1);
    if (currentSpace + 1 < totalGridSpaces && (currentSpace + 1) % numCols !== 0) adjacentSpaces.push(currentSpace + 1);
    if (currentSpace + numCols < totalGridSpaces) adjacentSpaces.push(currentSpace + numCols);

    return adjacentSpaces;
  }


  async addBordersToMaze(mazeSpaceElements, adjacencyList, mazeSpaces, numCols, totalGridSpaces) {
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

  findLongestPath(start, maze) {
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

  showLongestPath () {
    const mazeSpaceElements = this.mazeElement.querySelectorAll('.maze-space');
    this.longestPath.forEach(el => mazeSpaceElements[el].classList.add('maze-space--visited'));
  }

  hideLongestPath () {
    const mazeSpaceElements = this.mazeElement.querySelectorAll('.maze-space');
    mazeSpaceElements.forEach(el => el.classList.remove('maze-space--visited'));
  }

  moveCharacter(e, mazeSpaceElements) {
    const currentElement = mazeSpaceElements[this.currentPosition];

    // console.log(this.currentPosition, adjacentSpaces);

    if (e.key === 'w') {
      // console.log('w');
      if (!currentElement.classList.contains('top-border')) this.currentPosition -= this.cols;
    }

    if (e.key === 's') {
      // console.log('s');
      if (!currentElement.classList.contains('bottom-border')) this.currentPosition += this.cols;
    }

    if (e.key === 'a') {
      // console.log('a');
      if (!currentElement.classList.contains('left-border')) this.currentPosition -= 1;
    }

    if (e.key === 'd') {
      // console.log('d');
      if (!currentElement.classList.contains('right-border')) this.currentPosition += 1;
    }

    this.updatePosition();
    // console.log(this.currentPosition);
  }

  updatePosition () {
    // console.log(((this.currentPosition % this.cols) * 50));
    // console.log((Math.floor(this.currentPosition / this.cols) * 50));
    document.documentElement.style.setProperty('--translateX', ((this.currentPosition % this.cols) * 50) + 'px');
    document.documentElement.style.setProperty('--translateY', (Math.floor(this.currentPosition / this.cols) * 50) + 'px');
  }
}

const form = document.getElementById('mazeForm');
let mazeRef = null;

form.addEventListener('submit', (e) => {
  mazeRef = handleFormSubmit(e)
});

function handleFormSubmit(e) {
  e.preventDefault();

  const cols = document.querySelector('input[name="numCols"]').value * 1;
  const rows = document.querySelector('input[name="numRows"]').value * 1;
  const player = document.getElementById('player');
  const mazeElement = document.querySelector('.maze');

  resizeElements(cols, rows);

  document.querySelector('.maze-container').classList.remove('hide');
  document.querySelector('input[type="submit"]').disabled = true;

  return new Maze(player, cols, rows, mazeElement);
}

function resizeElements(cols, rows) {
  const width = window.innerWidth * .9;
  const height = window.innerHeight * .9;
  const square = Math.floor(Math.min(width, height));

  document.documentElement.style.setProperty('--width', square + 'px');
  document.documentElement.style.setProperty('--height', square + 'px');
  document.documentElement.style.setProperty('--cols', cols);
  document.documentElement.style.setProperty('--rows', rows);
}

function debounce(callback, waitTime) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(function () {
      callback.apply(null, args);
    }, waitTime);
  };
}

// use to create maze immediately
document.querySelector('input[type="submit"]').click();
console.dir(mazeRef);