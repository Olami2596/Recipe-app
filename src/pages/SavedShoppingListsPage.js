import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from 'docx';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

function SavedShoppingListsPage() {
  const [savedLists, setSavedLists] = useState([]);
  const [editingList, setEditingList] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSavedLists();
  }, [user.uid]);

  const fetchSavedLists = async () => {
    try {
      const q = query(
        collection(db, 'shoppingLists'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc') // Add this line to sort by createdAt in descending order
      );
      const querySnapshot = await getDocs(q);
      const lists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedLists(lists);
    } catch (error) {
      console.error("Error fetching saved shopping lists:", error);
      alert("Failed to fetch saved shopping lists. Please try again.");
    }
  };

  const handleEdit = (list) => {
    setEditingList({ ...list, items: [...list.items] });
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'shoppingLists', editingList.id);
      await updateDoc(docRef, { items: editingList.items });
      setEditingList(null);
      fetchSavedLists();
      alert("Shopping list updated successfully!");
    } catch (error) {
      console.error("Error updating shopping list:", error);
      alert("Failed to update shopping list. Please try again.");
    }
  };

  const handleDelete = async (listId) => {
    if (window.confirm("Are you sure you want to delete this shopping list?")) {
      try {
        await deleteDoc(doc(db, 'shoppingLists', listId));
        fetchSavedLists();
        alert("Shopping list deleted successfully!");
      } catch (error) {
        console.error("Error deleting shopping list:", error);
        alert("Failed to delete shopping list. Please try again.");
      }
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...editingList.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditingList({ ...editingList, items: updatedItems });
  };

  const exportToDOCX = (list) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph("Shopping List"),
          new Table({
            rows: list.items.map(item => 
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.name)] }),
                  new TableCell({ children: [new Paragraph(item.count.toString())] }),
                ],
              })
            ),
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `shopping_list_${list.id}.docx`);
    });
  };

  const exportToCSV = (list) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + list.items.map(item => `${item.name},${item.count}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shopping_list_${list.id}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportToExcel = (list) => {
    const ws = XLSX.utils.json_to_sheet(list.items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shopping List");
    XLSX.writeFile(wb, `shopping_list_${list.id}.xlsx`);
  };

  const exportToPDF = (list) => {
    const doc = new jsPDF();
    doc.text("Shopping List", 10, 10);
    doc.autoTable({
      head: [["Item", "Count"]],
      body: list.items.map(item => [item.name, item.count]),
    });
    doc.save(`shopping_list_${list.id}.pdf`);
  };

  return (
    <div>
      <h1>Saved Shopping Lists</h1>
      <Link to="/shopping-list">Back to Shopping List</Link>
      {savedLists.map(list => (
        <div key={list.id}>
          <h2>Shopping List {new Date(list.createdAt.seconds * 1000).toLocaleString()}</h2>
          {editingList && editingList.id === list.id ? (
            <div>
              {editingList.items.map((item, index) => (
                <div key={index}>
                  <input
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    value={item.count}
                    onChange={(e) => handleItemChange(index, 'count', parseInt(e.target.value))}
                  />
                </div>
              ))}
              <button onClick={handleSave}>Save Changes</button>
              <button onClick={() => setEditingList(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <ul>
                {list.items.map((item, index) => (
                  <li key={index}>{item.name} (x{item.count})</li>
                ))}
              </ul>
              <button onClick={() => handleEdit(list)}>Edit</button>
              <button onClick={() => handleDelete(list.id)}>Delete</button>
              <h3>Export Options:</h3>
              <button onClick={() => exportToDOCX(list)}>Export to DOCX</button>
              <button onClick={() => exportToCSV(list)}>Export to CSV</button>
              <button onClick={() => exportToExcel(list)}>Export to Excel</button>
              <button onClick={() => exportToPDF(list)}>Export to PDF</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SavedShoppingListsPage;