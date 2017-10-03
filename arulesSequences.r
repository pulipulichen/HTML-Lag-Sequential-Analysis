# Code Source: https://en.wikibooks.org/wiki/Data_Mining_Algorithms_In_R/Sequence_Mining/SPADE

# 最小支持度：篩選出至少40%的人共有的樣式
minSupport <- 0.4

# ------------------------
# 套件安裝

if(require("arules")){
  print("arules is loaded correctly")
} else {
  print("trying to install arules")
  install.packages("arules")
  if(require(arules)){
    print("arules installed and loaded")
  } else {
    stop("could not install arules")
  }
}

if(require("arulesSequences")){
  print("arulesSequences is loaded correctly")
} else {
  print("trying to install arulesSequences")
  install.packages("arulesSequences")
  if(require(arules)){
    print("arulesSequences installed and loaded")
  } else {
    stop("could not install arulesSequences")
  }
}

if(require("stringr")){
  print("stringr is loaded correctly")
} else {
  print("trying to install stringr")
  install.packages("stringr")
  if(require(stringr)){
    print("stringr installed and loaded")
  } else {
    stop("could not install stringr")
  }
}

# 套件載入
library(Matrix)
library(arules)
library(arulesSequences)
library(stringr)

# 定義函式trim()
trim <- function (x) gsub("^\\s+|\\s+$", "", x)

# --------------------------

df = read.csv(choose.files(default = "input.csv", caption = "Please select an input CSV file"), fileEncoding = "UTF-8")
#df = read.csv("data.csv", fileEncoding = "UTF-8") # 測試用

# 避免欄位變成charactor或factor，要轉換成string
df <- data.frame(lapply(df, as.character), stringsAsFactors=FALSE)

# 取得欄位名字
col.names <- colnames(df)

# 排序
df<-df[order(df[col.names[2]], decreasing = FALSE),]
df<-df[order(df[col.names[1]], decreasing = FALSE),]


# --------------------------

df3 <- data.frame(user_id = c(), seq_id=c(), events=c(), stringsAsFactors=FALSE)
colnames(df3) <- col.names

lastUserId <- 0
lastSeqId <- 0
lastIndex <- 0
for(i in 1:nrow(df)) {
  userId <- df[i,col.names[1]]
  seqId <- df[i,col.names[2]]
  if (i == 1) {
    
    df3 <- rbind(df3, df[i,])
    lastIndex <- i
    lastUserId <- userId
    lastSeqId <- seqId
  } else {
    if (lastUserId == userId && lastSeqId == seqId) {
      events1 <- df3[nrow(df3), col.names[3]]
      events2 <- df[i, col.names[3]]
      df3[nrow(df3), col.names[3]] <- paste(events1, events2)
    } else {
      df3 <- rbind(df3, df[i,])
      lastIndex <- i
      lastUserId <- userId
      lastSeqId <- seqId
    }
  }
}

df <- df3

# --------------------------

# 將分號;取代為空格
df[col.names[3]] <- sapply(df[col.names[3]], function(x) {
  gsub(";", " ", x)
})

# 計算事件的數量
df$Event_count <- sapply(df[,col.names[3]], function(x) {
  length(unlist(strsplit(as.character(trim(x)), "\\W+")))
})

df2<-data.frame("score"=df[col.names[1]],"sequence_length"=df[col.names[2]],"support"=df["Event_count"],"sequence"=df[col.names[3]], stringsAsFactors=FALSE)

tmp.txt <- "tmp.txt"
write.table(df2, file=tmp.txt, row.names=FALSE, col.names=FALSE, sep=" ", quote=FALSE)

# --------------------------

x <- read_baskets(tmp.txt, info = c("sequenceID","eventID","SIZE"))
s1 <- cspade(x, parameter = list(support = minSupport), control = list(verbose = TRUE))

# -------------

s2<-as(s1, "data.frame")
s2["sequence_length"]<-c(str_count(array(unlist(s2["sequence"])), "\\},\\{")+1)
s2["score"]<-c(s2["sequence_length"]*s2["support"])
s2<-s2[order(s2["score"], decreasing = TRUE),]
s3<-data.frame("score"=s2["score"],"sequence_length"=s2["sequence_length"],"support"=s2["support"],"sequence"=s2["sequence"], stringsAsFactors=FALSE)
s3$score <- sapply(s3$score, function(x) {
  round(x, 3)
})
s3$support <- sapply(s3$support, function(x) {
  round(x, 3)
})

# 寫入檔案
write.table(s3, file=choose.files(default = paste0("output-",format(Sys.time(), "%m%d-%H%M"),".csv"), caption = "Please specify the output CSV file path"), row.names=FALSE, sep=",")

# -------------
file.remove(tmp.txt)