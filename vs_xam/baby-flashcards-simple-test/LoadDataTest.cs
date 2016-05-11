using System;
using System.IO;
using System.Reflection;
using babyflashcards;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace baby_flashcards_simple_test
{
    [TestClass]
    public class LoadDataTest
    {
        [TestMethod]
        public void LoadJsonFileTest()
        {
            var codeBase = Assembly.GetExecutingAssembly().CodeBase;
            var uri = new UriBuilder(codeBase);
            var path = Uri.UnescapeDataString(uri.Path);
            var basePath = Path.GetDirectoryName(path);
            var dataFilePath = basePath  + @"\Resources\appdata.json"; 
            var json = File.ReadAllText(dataFilePath);
            var data = Newtonsoft.Json.JsonConvert.DeserializeObject<AppData>(json);

            Assert.AreEqual(data.DeckSets.Count, 2);
        }
    }
}
