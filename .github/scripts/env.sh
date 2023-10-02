BRANCH_NAME=$1

BRANCH_PREFIX=`echo $BRANCH_NAME | cut -d/ -f1`

if [[ $BRANCH_PREFIX == "feature"  ]]
then
        echo "dev"
elif [[ $BRANCH_PREFIX == "release"  ]]
then
        echo "release"
else
        echo "staging"
fi