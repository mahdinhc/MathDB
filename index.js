const owner = "mahdinhc";        
const repo = "MathDB";      
const branch = "main";   
const directory = "database"; 
const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

function getBasename(path) {
  const base = path.split(/[\\/]/).pop();
  const dotIndex = base.lastIndexOf('.');
  return dotIndex > 0 ? base.substring(0, dotIndex) : base;
}

function parseMath(str) {
	let elm = document.createElement("div")
	elm.setAttribute("class", "math-container")
	let lines = str.split("\n")
	for (let line of lines) {
		elm.appendChild(asciimath.parseMath(line))
	}
	return elm
}

function buildJsTreeData(flatTree, directory) {
  const treeData = [];
  const dirPrefix = directory ? `${directory}/` : "";

  flatTree.forEach(item => {
    if (!item.path.startsWith(dirPrefix)) return;

    let relativePath = item.path.substring(dirPrefix.length); 
    if (!relativePath) return; 

    let parent = "#";
    if (relativePath.includes('/')) {
      parent = relativePath.substring(0, relativePath.lastIndexOf('/'));
      if (parent === "") {
        parent = "#";
      }
    }

    treeData.push({
      id: relativePath,
      parent: parent, 
      text: relativePath.split('/').pop(), 
      icon: item.type === 'tree' ? "jstree-folder" : "jstree-file"
    });
  });

  return treeData;
}

function updateNode() {
	$('.jstree-anchor').each(function(){
		var nodeText = $(this).text()
		if (nodeText.substring(nodeText.lastIndexOf('.')) == ".asc") {
			nodeText = getBasename(nodeText)
			$(this).html(asciimath.parseMath(nodeText))
		}
	})
}

$(document).ready(function() {
	$.getJSON(apiUrl, function(data) {
		if (data && data.tree) {
			const treeData = buildJsTreeData(data.tree, directory)
			$('#repoTree').jstree({
				core: {
					data: treeData
				}
			})
			.on('redraw.jstree', updateNode)
			.click('redraw.jstree', updateNode)
			.on('select_node.jstree', function(e, data) {
				const node = data.node;
				if (node.icon === "jstree-file") {
					console.log(node.id)
					const filePath = directory ? `${directory}/${node.id}` : node.id
					const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`
					$.get(rawUrl, function(fileData) {
						if (node.id.substring(node.id.lastIndexOf('.')) == ".asc") {
							$('#fileContent').html(parseMath(fileData))
						}
						else $('#fileContent').html(fileData)
					}).fail(function() {
						$('#fileContent').text("Error fetching file content.")
					});
				} 
				else {
					$('#fileContent').text("Select a file to view its content.")
				}
			})
		}
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		$('#repoTree').html('<p>Error fetching repository tree data. Please check the repository details and try again.</p>')
	})
})
